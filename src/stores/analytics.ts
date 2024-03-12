import { createInstance } from '@amplitude/analytics-browser'
import { BaseEvent, BrowserClient } from '@amplitude/analytics-types'
import { toSubsocialAddress } from '@subsocial/utils'
import Router from 'next/router'
import { createUserId } from 'src/components/utils/OffchainUtils'
import { ampId } from 'src/config/env'
import { LocalStorage } from 'src/utils/storage'
import { create } from './utils'

const DEVICE_ID_STORAGE_KEY = 'device_id'
const deviceIdStorage = new LocalStorage(() => DEVICE_ID_STORAGE_KEY)

type EventProperties = {
  /// The source in Grill from which the event was sent
  eventSource?: string
  hubId?: string
  chatId?: string
  chatOwner?: boolean
  [key: string]: any
}

export type UserProperties = {
  cameFrom?: string
  cohortDate?: Date
  polkadotLinked?: boolean
  twitterLinked?: boolean
  pwaInstalled?: boolean
  evmLinked?: boolean
  tgNotifsConnected?: boolean
  webNotifsEnabled?: boolean
  ownedChat?: boolean
  hasJoinedChats?: boolean
  hasPersonalizedProfile?: boolean
  ref?: string
  deviceId?: string
  userId?: string
}

type State = {
  amp: BrowserClient | null
  userId: string | undefined
  deviceId: string | undefined
}
type Actions = {
  sendEvent: (
    name: string,
    eventProperties?: EventProperties,
    userProperties?: UserProperties,
  ) => void
  removeUserId: () => void
  setUserId: (address: string) => void
  _updateUserId: (address: string | undefined) => void
}

const queuedEvents: BaseEvent[] = []

const initialState: State = {
  amp: null,
  userId: undefined,
  deviceId: undefined,
}

export const useAnalytics = create<State & Actions>()((set, get) => {
  return {
    ...initialState,
    _updateUserId: async (address: string | undefined) => {
      const { amp } = get()
      if (address) {
        try {
          const userId = await createUserId(toSubsocialAddress(address)!)
          amp?.setUserId(userId)
          set({ userId })
        } catch (err) {
          console.error('Error creating user id', err)
        }
      } else {
        amp?.setUserId(undefined)
        set({ userId: undefined })
      }
    },
    removeUserId: () => {
      const { _updateUserId } = get()
      _updateUserId(undefined)
    },
    setUserId: (address: string) => {
      const { _updateUserId } = get()
      _updateUserId(address)
    },
    sendEvent: async (
      name: string,
      eventProperties?: EventProperties,
      userProperties?: UserProperties,
    ) => {
      const { amp, userId, deviceId } = get()

      const commonProperties = {
        pathname: Router.asPath,
      }

      const mergedEventProperties = {
        ...commonProperties,
        ...eventProperties,
      }

      const eventProps = {
        event_type: name,
        event_properties: mergedEventProperties,
        user_properties: userProperties,
        user_id: userId,
        device_id: deviceId,
      }

      if (!amp) queuedEvents.push(eventProps)
      else amp?.logEvent(eventProps)
    },
    init: async () => {
      const amp = await createAmplitudeInstance()

      let deviceId = deviceIdStorage.get() || undefined

      if (!deviceId) {
        deviceId = amp?.getDeviceId()
      }

      set({ amp, deviceId })
      queuedEvents.forEach(props => {
        amp?.logEvent({
          ...props,
          device_id: deviceId,
        })
      })
    },
  }
})

export function useSendEvent() {
  const sendEvent = useAnalytics(state => state.sendEvent)
  return sendEvent
}

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
