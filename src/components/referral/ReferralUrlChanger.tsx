import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useSelectProfileSpace } from 'src/rtk/app/hooks'
import { getCurrentSearchParams, getCurrentUrlWithoutQuery } from 'src/utils/url'
import { useMyAddress } from '../auth/MyAccountsContext'

export function useReferralId() {
  const myAddress = useMyAddress()
  const profileSpace = useSelectProfileSpace(myAddress)
  return profileSpace?.spaceId ?? ''
}

export function ReferralUrlChanger() {
  const referralId = useReferralId()
  const router = useRouter()

  useEffect(() => {
    if (!referralId) return
    const current = getCurrentSearchParams()

    const newPath = `${getCurrentUrlWithoutQuery()}?${current.toString()}`
    router.replace(newPath, undefined, { shallow: true })
  }, [referralId, router.pathname])

  return null
}
