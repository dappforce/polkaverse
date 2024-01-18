import { createInstance } from '@amplitude/analytics-browser'
import { BaseEvent, BrowserClient } from '@amplitude/analytics-types'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { ampId } from 'src/config/env'
import { useFetchProfileSpace } from 'src/rtk/app/hooks'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getAmountRange } from 'src/utils/analytics'

type AnalyticContextState = {
  amp: BrowserClient | null
  deviceId?: string
}

const initialState: AnalyticContextState = {
  amp: null,
  deviceId: undefined,
}

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

export async function createAmplitudeInstance() {
  if (typeof window === 'undefined') return null
  if (!ampId) return null

  try {
    const amp = createInstance()
    await amp.init(ampId, undefined, { identityStorage: 'localStorage' }).promise
    return amp
  } catch (e) {
    console.error('Error initializing amplitude', e)
    return null
  }
}

export function AnalyticProvider(props: React.PropsWithChildren<{}>) {
  const [state, setState] = useState(initialState)
  const [queuedEvents, setQueuedEvents] = useState<BaseEvent[]>([])
  const isInited = useRef(false)

  useEffect(() => {
    if (isInited.current) return
    isInited.current = true

    async function initAmp() {
      const amp = await createAmplitudeInstance()

      let deviceId = localStorage.getItem('device_id') || undefined
      if (!deviceId) {
        deviceId = amp?.getDeviceId()
      }

      setState({ amp, deviceId })
      queuedEvents.forEach(props => {
        amp?.logEvent({
          ...props,
          device_id: deviceId,
        })
      })
    }
    initAmp()
  }, [])

  const contextValue: AnalyticContextProps = useMemo(() => {
    return {
      amp: state.amp,
      sendEvent: (
        name: string,
        properties?: Record<string, any>,
        userProperties?: Record<string, any>,
      ) => {
        const eventProps = {
          event_type: name,
          device_id: state.deviceId,
          event_properties: properties,
          user_properties: userProperties,
        }
        if (!state.amp) {
          setQueuedEvents(prev => [...prev, eventProps])
          return
        }
        state.amp.logEvent(eventProps)
      },
    }
  }, [state])

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
    if (!myAddress) {
      state.sendEvent('app_launched', { signIn: false })
      return
    }
    state.sendEvent(
      'app_launched',
      { signIn: true },
      {
        hasProfile,
        stakeAmountRange: getAmountRange(totalStake?.amount),
        device_id: amp?.getDeviceId(),
        hasCreatorRewards,
      },
    )
  }, [hasProfile, isLoading, hasCreatorRewards, amp])

  return null
}
