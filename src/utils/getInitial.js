export function getInitial(user) {
  const name = user?.user_metadata?.name
  if (name) return name[0].toUpperCase()
  return user?.email ? user.email[0].toUpperCase() : ''
}
