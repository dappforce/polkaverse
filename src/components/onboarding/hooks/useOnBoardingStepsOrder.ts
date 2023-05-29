import { useMemo } from 'react'
import { useAuth } from 'src/components/auth/AuthContext'
import { useIsUsingEmail, useMyAddress } from 'src/components/auth/MyAccountsContext'
import { isProxyAdded } from 'src/components/utils/OffchainSigner/ExternalStorage'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { OnBoardingDataTypes } from 'src/rtk/features/onBoarding/onBoardingSlice'
import { useIsFollowSpaceModalUsedContext } from '../contexts/IsFollowSpaceModalUsed'
import { useIsProxyAddedContext } from '../contexts/IsProxyAdded'

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
  const { isProxyAdded: isProxyAddedState } = useIsProxyAddedContext()
  const isUsingEmail = useIsUsingEmail()

  // hide sidebar button when accounts are already added with proxy
  const isCurrentAddressAddedWithProxy = isProxyAdded(myAddress!)

  const steps = useMemo(() => {
    if (!myAddress) return []

    let usedSteps: (keyof OnBoardingDataTypes)[] = []

    if (!(profile?.content as any)?.interests) usedSteps.push('topics')
    if (!isCompact || !isFollowSpaceModalUsed) usedSteps.push('spaces')
    if (!profile?.content?.name) usedSteps.push('profile')

    const showEnergyStep =
      !isUsingEmail && !isCompact
        ? (additionalData?.energySnapshot ?? 0) < 20
        : transactionsCount < 20
    if (showEnergyStep) usedSteps.push('energy')

    const showSignerStep = !isCurrentAddressAddedWithProxy && !isProxyAddedState

    if (showSignerStep) usedSteps.push('signer')

    if (usedSteps.length > 0) usedSteps.push('confirmation')

    return usedSteps
  }, [
    myAddress,
    profile,
    status,
    isFollowSpaceModalUsed,
    isCurrentAddressAddedWithProxy,
    isProxyAddedState,
    additionalData?.energySnapshot,
  ])

  return { steps }
}
