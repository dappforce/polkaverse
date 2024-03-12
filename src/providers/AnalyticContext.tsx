import { BrowserClient } from '@amplitude/analytics-types'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { getReferralIdInUrl } from 'src/components/referral/utils'
import { getReferrerId } from 'src/components/utils/datahub/referral'
import { useFetchProfileSpace } from 'src/rtk/app/hooks'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { useAnalytics } from 'src/stores/analytics'
import { getAmountRange } from 'src/utils/analytics'

export type AnalyticContextProps = {
  amp: BrowserClient | null
  sendEvent: (
    name: string,
    properties?: Record<string, any>,
    userProperties?: Record<string, any>,
  ) => void
}

const propsStub = { sendEvent: () => undefined, amp: null }
export const AnalyticContext = createContext<AnalyticContextProps>(propsStub)

export function AnalyticProvider(props: React.PropsWithChildren<{}>) {
  const amp = useAnalytics(state => state.amp)
  const sendEvent = useAnalytics(state => state.sendEvent)

  const contextValue: AnalyticContextProps = useMemo(() => {
    return {
      amp,
      sendEvent,
    }
  }, [amp, sendEvent])

  return <AnalyticContext.Provider value={contextValue}>{props.children}</AnalyticContext.Provider>
}

export function useSendEvent() {
  return useContext(AnalyticContext).sendEvent
}

export function useBuildSendEvent(eventName: string) {
  const sendEvent = useSendEvent()

  return useCallback(
    (properties?: Record<string, any>) => {
      sendEvent(eventName, properties)
    },
    [eventName],
  )
}

export default AnalyticProvider

export function AppLaunchedEventSender() {
  const state = useContext(AnalyticContext)

  const myAddress = useMyAddress() ?? ''
  const { entity, loading: loadingProfile } = useFetchProfileSpace({ id: myAddress })
  const { data: totalStake, loading: loadingTotalStake } = useFetchTotalStake(myAddress)
  const { data: rewardReport, loading: loadingRewardReport } = useFetchUserRewardReport(myAddress)

  const amp = state.amp
  const hasProfile = !!entity
  const hasCreatorRewards = BigInt(rewardReport?.creatorReward ?? '0') > 0
  const sentInitRef = useRef(false)
  const isLoading = loadingProfile || loadingTotalStake || loadingRewardReport
  useEffect(() => {
    if (isLoading || sentInitRef.current) return
    sentInitRef.current = true
    sendLaunchedEvent()

    async function sendLaunchedEvent() {
      if (!myAddress) {
        state.sendEvent('app_launched', { signIn: false }, { ref: getReferralIdInUrl() })
        return
      }
      let refId = getReferralIdInUrl()
      try {
        const referrerId = await getReferrerId(myAddress)
        if (referrerId) {
          refId = referrerId
        }
      } catch {}
      state.sendEvent(
        'app_launched',
        { signIn: true },
        {
          hasProfile,
          stakeAmountRange: getAmountRange(totalStake?.amount),
          device_id: amp?.getDeviceId(),
          hasCreatorRewards,
          ref: refId,
        },
      )
    }
  }, [hasProfile, isLoading, hasCreatorRewards, amp])

  return null
}
