export function isServerSide(): boolean {
  return typeof window === 'undefined'
}

export function isClientSide(): boolean {
  return !isServerSide()
}
