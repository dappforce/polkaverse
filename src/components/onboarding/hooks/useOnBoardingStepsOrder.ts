import { useMemo } from 'react'
import { useAuth } from 'src/components/auth/AuthContext'
import { useMyAddress, useMyEmailAddress } from 'src/components/auth/MyAccountsContext'
import {
  isCurrentSignerAddress,
  isProxyAdded,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { OnBoardingDataTypes } from 'src/rtk/features/onBoarding/onBoardingSlice'
import { useIsFollowSpaceModalUsedContext } from '../contexts/IsFollowSpaceModalUsed'

export default function useOnBoardingStepsOrder(
  isCompact?: boolean,
  additionalData?: {
    energySnapshot: number
  },
) {
  const {
    energy: { status, transactionsCount },
  } = useAuth()
  const myAddress = useMyAddress()
  const profile = useSelectProfile(myAddress)
  const { isFollowSpaceModalUsed } = useIsFollowSpaceModalUsedContext()
  const isSignerAddress = isCurrentSignerAddress(myAddress!)

  // Hide sidebar popups for users with email
  const myEmailAddress = useMyEmailAddress()
  // and when accounts are already added with proxy
  const isCurrentAddressAddedWithProxy = isProxyAdded(myAddress!)

  return useMemo(() => {
    if (!myAddress) return []

    const usedSteps: (keyof OnBoardingDataTypes)[] = []

    if (!(profile?.content as any)?.interests) usedSteps.push('topics')
    if (!isCompact || !isFollowSpaceModalUsed) usedSteps.push('spaces')
    if (!profile?.content?.name) usedSteps.push('profile')

    const showEnergyStep = !isCompact
      ? (additionalData?.energySnapshot ?? 0) < 20
      : transactionsCount < 20
    if (showEnergyStep) usedSteps.push('energy')

    const showSignerStep = !isCurrentAddressAddedWithProxy && !myEmailAddress

    if (showSignerStep) usedSteps.push('signer')

    if (usedSteps.length > 0) usedSteps.push('confirmation')

    return usedSteps
  }, [
    myAddress,
    profile,
    status,
    isFollowSpaceModalUsed,
    isSignerAddress,
    isCurrentAddressAddedWithProxy,
    myEmailAddress,
    additionalData?.energySnapshot,
  ])
}
