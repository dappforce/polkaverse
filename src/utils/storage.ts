const storagePrefix = 'df.'

function truncateAddress(address: string) {
  const suffix = address.substring(address.length - 4, address.length)
  const prefix = address.substring(0, 4)
  return `${prefix}...${suffix}`
}

export function createStorageKey(name: string, address?: string) {
  return storagePrefix + name + (address ? `:${truncateAddress(address)}` : '')
}
