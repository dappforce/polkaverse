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
import { ampId } from 'src/config/env'

type AnalyticContextState = {
  amp: BrowserClient | null
  deviceId?: string
}

const initialState: AnalyticContextState = {
  amp: null,
  deviceId: undefined,
}

export type AnalyticContextProps = {
  sendEvent: (name: string, properties?: Record<string, any>) => void
}

const propsStub = { sendEvent: () => undefined }
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
      sendEvent: (name: string, properties?: Record<string, any>) => {
        const eventProps = {
          event_type: name,
          device_id: state.deviceId,
          ...properties,
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
