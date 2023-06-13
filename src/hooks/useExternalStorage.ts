import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { isClientSide } from 'src/components/utils'
import { createStorageKey } from 'src/utils/storage'

const getStorageData = (key: string) => {
  if (!isClientSide()) return ''
  return localStorage.getItem(key) ?? ''
}
const setStorageData = (key: string, newData: string) => {
  if (!isClientSide()) return
  localStorage.setItem(key, newData)
}
const removeStorageData = (key: string) => {
  if (!isClientSide()) return
  localStorage.removeItem(key)
}

type UseExternalStorageConfig<T> = {
  parseStorageToState?: (data: string) => T
  parseStateToStorage?: (data: T) => string | undefined
  storageKeyType?: 'guest' | 'user' | 'both'
  subscribe?: boolean
}

export default function useExternalStorage<T = string>(
  key: string,
  config?: UseExternalStorageConfig<T>,
) {
  const address = useMyAddress()

  const storageKeyType = config?.storageKeyType ?? 'both'
  const parseStorageToState = config?.parseStorageToState ?? (data => data as T)
  const parseStateToStorage = config?.parseStateToStorage ?? (data => data as string)

  const storageKey = useMemo(() => {
    if (storageKeyType === 'user' && !address) return

    let storageKey = createStorageKey(key, address)
    if (storageKeyType === 'guest') {
      storageKey = createStorageKey(key)
    }
    return storageKey
  }, [key, address, storageKeyType])

  const [data, _setData] = useState<T>()

  const syncData = useCallback(() => {
    if (!storageKey) return
    const storageData = getStorageData(storageKey)
    _setData(parseStorageToState(storageData))
  }, [storageKey])

  useEffect(() => {
    syncData()
  }, [storageKey, storageKeyType])

  useEffect(() => {
    if (!config?.subscribe) return

    window.addEventListener('storage', () => {
      syncData()
    })
  }, [config?.subscribe, syncData])

  const setData = useCallback(
    (newData: T | undefined, tempAddress?: string) => {
      _setData(newData)
      if (!storageKey) return
      if (newData === undefined) {
        removeStorageData(storageKey)
      } else {
        const newStorageData = parseStateToStorage(newData)
        if (newStorageData === undefined) removeStorageData(storageKey)
        else {
          if (tempAddress) {
            setStorageData(createStorageKey(key, tempAddress), newStorageData)
            return
          }
          setStorageData(storageKey, newStorageData)
        }
      }
    },
    [key, address],
  )

  const getDataForAddress = useCallback(
    (address: string) => {
      const storageKey = createStorageKey(key, address)
      const storageData = getStorageData(storageKey)
      return parseStorageToState(storageData)
    },
    [key],
  )

  return {
    data,
    setData,
    getDataForAddress,
  }
}

export function useBooleanExternalStorage(
  key: string,
  config?: Omit<UseExternalStorageConfig<boolean>, 'parseStateToStorage' | 'parseStorageToState'>,
) {
  return useExternalStorage(key, {
    ...config,
    parseStorageToState: data => data === '1',
    parseStateToStorage: state => (state ? '1' : undefined),
  })
}
