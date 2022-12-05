type SetOrArray<T> = Set<T> | Array<T>

export const eqSet = <T>(as: SetOrArray<T>, bs: SetOrArray<T>) => {
  if (Array.isArray(as)) {
    as = new Set(as)
  }

  if (Array.isArray(bs)) {
    bs = new Set(bs)
  }

  if (as.size !== bs.size) return false
  for (const a of as) {
    if (!bs.has(a)) return false
  }
  return true
}
