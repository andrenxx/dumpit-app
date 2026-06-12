-- ================================================
-- 002_rls_policies.sql
-- ================================================

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_data"
  ON public.users FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "tasks_own_data"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "ai_conversations_own_data"
  ON public.ai_conversations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "checkins_own_data"
  ON public.daily_checkins FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "ai_usage_own_data"
  ON public.ai_usage FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "push_own_data"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);
