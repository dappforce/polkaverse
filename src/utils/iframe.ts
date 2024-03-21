export function parseGrillMessage(data: string) {
  const match = data.match(/^([^:]+):([^:]+):(.+)$/)
  if (!match) return null

  const origin = match[1]
  const name = match[2]
  const value = match[3]
  if (origin !== 'grill') return null
  return { name: name ?? '', value: value ?? '' }
}
