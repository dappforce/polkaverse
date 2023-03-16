import { useMemo } from 'react'
import { useAuth } from 'src/components/auth/AuthContext'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { isCurrentOffchainAddress } from 'src/components/utils/OffchainSigner/ExternalStorage'
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
  const isOffchainAddress = isCurrentOffchainAddress(myAddress!)

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

    if (usedSteps.length > 0) usedSteps.push('confirmation')

    return usedSteps
  }, [
    myAddress,
    profile,
    status,
    isFollowSpaceModalUsed,
    isOffchainAddress,
    additionalData?.energySnapshot,
  ])
}
