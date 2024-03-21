import { useEffect } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { datahubSubscriptionUrl } from 'src/config/env'
import { subscribeSuperLike } from './active-staking'
import { subscribeModeration } from './moderation'

function useDatahubSubscriber() {
  const myAddress = useMyAddress()

  useEffect(() => {
    if (!datahubSubscriptionUrl) return

    const unsubSuperLike = subscribeSuperLike(myAddress)
    const unsubModeration = subscribeModeration()
    return () => {
      unsubSuperLike?.()
      unsubModeration?.()
    }
  }, [myAddress])
}

export function DatahubSubscriber() {
  useDatahubSubscriber()
  return null
}
