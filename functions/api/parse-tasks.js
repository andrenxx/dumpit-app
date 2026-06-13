import { createClient } from '@supabase/supabase-js'

const ALLOWED_ORIGINS = [
  'https://dumpit.com.br',
  'https://www.dumpit.com.br',
  'http://localhost:5173',
]

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  }
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  })
}

const CLAUDE_SYSTEM_PROMPT = `You are a task parser for a Brazilian productivity app called DumpIt.
The user will send a natural language dump of things they need to do,
in Brazilian Portuguese. Extract each distinct task and return a JSON array.

Each task object must have:
- "title": string (max 200 chars, PT-BR, imperative form)
- "priority": "alta" | "media" | "baixa"
- "status": always "a_fazer"

Return ONLY valid JSON — no markdown, no explanation, no code blocks.
Example: [{"title":"Ligar para o cliente","priority":"alta","status":"a_fazer"}]`

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin') || ''

  const supabase = createClient(
    context.env.SUPABASE_URL,
    context.env.SUPABASE_SERVICE_ROLE_KEY,
  )

  // 1. Extract JWT
  const authHeader = context.request.headers.get('Authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return json({ error: 'unauthorized' }, 401, origin)

  // 2. Verify JWT
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return json({ error: 'unauthorized' }, 401, origin)

  const userId = user.id

  // 3. Fetch user plan
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()

  if (profileError || !profile) return json({ error: 'unauthorized' }, 401, origin)

  // 4. Freemium gate — free plan: 1 call lifetime
  if (profile.plan === 'free') {
    const { count, error: usageError } = await supabase
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (!usageError && count >= 1) {
      return json({ error: 'upgrade_required' }, 402, origin)
    }
  }

  // 5. Parse request body
  let body
  try {
    body = await context.request.json()
  } catch {
    return json({ error: 'invalid_json' }, 400, origin)
  }

  const text = (body?.text || '').trim()
  if (!text) return json({ error: 'text_required' }, 400, origin)

  // 6. Call Claude API
  let parsedTasks
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': context.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: CLAUDE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!claudeRes.ok) return json({ error: 'ai_unavailable' }, 502, origin)

    const claudeData = await claudeRes.json()
    const rawContent = claudeData?.content?.[0]?.text || ''
    parsedTasks = JSON.parse(rawContent)

    if (!Array.isArray(parsedTasks)) throw new Error('not an array')
  } catch {
    return json({ error: 'ai_unavailable' }, 502, origin)
  }

  // 7. Insert tasks into public.tasks
  const taskRows = parsedTasks.map((t, i) => ({
    user_id: userId,
    title: String(t.title || '').slice(0, 200),
    priority: ['alta', 'media', 'baixa'].includes(t.priority) ? t.priority : 'media',
    status: 'a_fazer',
    position: i,
  }))

  const { data: insertedTasks, error: tasksError } = await supabase
    .from('tasks')
    .insert(taskRows)
    .select()

  if (tasksError) return json({ error: 'db_error' }, 500, origin)

  // 8. Log ai_conversation
  await supabase.from('ai_conversations').insert({
    user_id: userId,
    raw_input: text,
    parsed_tasks: parsedTasks,
  })

  // 9. Record ai_usage — increment calls_count accurately
  // supabase-js upsert doesn't support column expressions, so use SELECT + INSERT/UPDATE
  const today = new Date().toISOString().split('T')[0]
  const { data: existingUsage } = await supabase
    .from('ai_usage')
    .select('id, calls_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  if (existingUsage) {
    await supabase
      .from('ai_usage')
      .update({ calls_count: existingUsage.calls_count + 1 })
      .eq('id', existingUsage.id)
  } else {
    await supabase
      .from('ai_usage')
      .insert({ user_id: userId, date: today, calls_count: 1 })
  }

  return json({ tasks: insertedTasks }, 200, origin)
}

export async function onRequest(context) {
  const origin = context.request.headers.get('Origin') || ''
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }
  return json({ error: 'method_not_allowed' }, 405, origin)
}
