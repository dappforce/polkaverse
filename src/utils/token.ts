export function isExpExpired(exp: number) {
  const currentTime = Date.now() / 1000
  return exp < currentTime
}
