const storagePrefix = 'df.'

export function truncateAddress(address: string) {
  const suffix = address.substring(address.length - 4, address.length)
  const prefix = address.substring(0, 4)
  return `${prefix}...${suffix}`
}

export function createStorageKey(name: string, address?: string) {
  return storagePrefix + name + (address ? `:${truncateAddress(address)}` : '')
}

type Storage<Params extends unknown[]> = {
  get: (...params: Params) => string | undefined | null
  set: (value: string, ...params: Params) => void
  remove: () => void
}

export class LocalStorage<Params extends unknown[]> implements Storage<Params> {
  constructor(private readonly nameGetter: (...params: Params) => string) {}

  get(...params: Params) {
    try {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(this.nameGetter(...params))
    } catch {
      return null
    }
  }
  set(value: string, ...params: Params) {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(this.nameGetter(...params), value)
    } catch {}
  }
  remove(...params: Params) {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(this.nameGetter(...params))
    } catch {}
  }
}

export class SessionStorage<Params extends unknown[]> implements Storage<Params> {
  constructor(private readonly nameGetter: (...params: Params) => string) {}

  get(...params: Params) {
    try {
      if (typeof window === 'undefined') return null
      return sessionStorage.getItem(this.nameGetter(...params))
    } catch {
      return null
    }
  }
  set(value: string, ...params: Params) {
    try {
      if (typeof window === 'undefined') return
      sessionStorage.setItem(this.nameGetter(...params), value)
    } catch {}
  }
  remove(...params: Params) {
    try {
      if (typeof window === 'undefined') return
      sessionStorage.removeItem(this.nameGetter(...params))
    } catch {}
  }
}
