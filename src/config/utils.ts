export function getOrDefault<V>(value: V | undefined, defaultValue: V): V {
  return typeof value !== 'undefined' ? value : defaultValue
}

export function getOrTrue(value?: boolean): boolean {
  return getOrDefault(value, true)
}

export function getOrFalse(value?: boolean): boolean {
  return getOrDefault(value, false)
}
