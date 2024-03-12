import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSelectProfileSpace } from 'src/rtk/app/hooks'
import { getCurrentSearchParams, getCurrentUrlWithoutQuery } from 'src/utils/url'
import { useMyAddress } from '../auth/MyAccountsContext'
import { getReferralIdInUrl } from './utils'

export function useReferralId() {
  const myAddress = useMyAddress()
  const profileSpace = useSelectProfileSpace(myAddress)
  return profileSpace?.spaceId || getReferralIdInUrl()
}

export function ReferralUrlChanger() {
  const referralId = useReferralId()
  const router = useRouter()

  useEffect(() => {
    if (!referralId) return
    const current = getCurrentSearchParams()
    current.set('ref', referralId)

    const newPath = `${getCurrentUrlWithoutQuery()}?${current.toString()}`
    router.replace(newPath, undefined, { shallow: true })
  }, [referralId, router.pathname])

  return null
}
