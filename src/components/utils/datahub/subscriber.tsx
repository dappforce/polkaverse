import { useEffect, useRef } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { datahubSubscriptionUrl } from 'src/config/env'
import { subscribeSuperLike } from './super-likes'

function useDatahubSubscriber() {
  const unsubRef = useRef<(() => void) | undefined>()
  const myAddress = useMyAddress()

  useEffect(() => {
    if (!datahubSubscriptionUrl) return

    unsubRef.current = subscribeSuperLike(myAddress)
    return () => {
      unsubRef.current?.()
    }
  }, [myAddress])
}

export function DatahubSubscriber() {
  useDatahubSubscriber()
  return null
}
