export function getOrCreateAnonymousId() {
  let id = localStorage.getItem('dumpit_anonymous_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('dumpit_anonymous_id', id)
  }
  return id
}
