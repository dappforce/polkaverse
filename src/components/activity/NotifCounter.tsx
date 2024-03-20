import { Badge } from 'antd'
import clsx from 'clsx'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { FaRegBell } from 'react-icons/fa'
import config from 'src/config'
import { useGetNotificationsCount } from 'src/graphql/hooks'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { useMyAccount } from 'src/stores/my-account'
import { useMyAddress } from '../auth/MyAccountsContext'
import CustomLink from '../referral/CustomLink'
import styles from './style.module.sass'

const { enableNotifications } = config

export type UpdateLastReadNotificationFn = (lastReadDate: string) => void
export type NotifCounterContextProps = {
  unreadCount: number
  getLastReadNotif: (address: string) => string | undefined
  updateLastReadNotification: UpdateLastReadNotificationFn
  previousLastRead: string | null
}

export const NotifCounterContext = createContext<NotifCounterContextProps>({
  unreadCount: 0,
  getLastReadNotif: () => undefined,
  updateLastReadNotification: {} as any,
  previousLastRead: null,
})

const LAST_READ_NOTIFICATION_KEY = 'lastReadNotification'

function InnerNotifCounterProvider(props: React.PropsWithChildren<{}>) {
  const { getDataForAddress, setData } = useExternalStorage(LAST_READ_NOTIFICATION_KEY, {
    storageKeyType: 'user',
  })
  const myAddress = useMyAddress()
  const isInitialized = useMyAccount(state => state.isInitialized)

  const [unreadCount, setUnreadCount] = useState(0)
  const [previousLastRead, setPreviousLastRead] = useState<string | null>(null)
  const getNotificationsCount = useGetNotificationsCount()
  const updateLastReadNotification = (newLastRead: string) => {
    if (!myAddress) return
    setPreviousLastRead(getDataForAddress(myAddress))
    setUnreadCount(0)
    setData(newLastRead)
  }

  useEffect(() => {
    if (!isInitialized || !myAddress) return
    ;(async () => {
      const unreadCount = await getNotificationsCount({
        address: myAddress,
        afterDate: getDataForAddress(myAddress) || undefined,
      })
      setUnreadCount(unreadCount)
    })()
  }, [myAddress, isInitialized])

  return (
    <NotifCounterContext.Provider
      value={{
        unreadCount,
        getLastReadNotif: getDataForAddress,
        updateLastReadNotification,
        previousLastRead,
      }}
    >
      {props.children}
    </NotifCounterContext.Provider>
  )
}

export function NotifCounterProvider(props: React.PropsWithChildren<{}>) {
  return <InnerNotifCounterProvider {...props} />
}

export const useNotifCounterContext = () => {
  return useContext(NotifCounterContext)
}

const notificationItem = {
  name: 'My notifications',
  page: ['/notifications', '/notifications'],
  icon: <FaRegBell className='bell d-block' />,
}

type NotificationsProps = {
  unreadCount: number
}

const Bell = ({ unreadCount }: NotificationsProps) => (
  <CustomLink href={notificationItem.page[0]} as={notificationItem.page[1]}>
    <a className={clsx('DfNotificationsCounter d-block', unreadCount > 9 && 'mr-1')}>
      {notificationItem.icon}
    </a>
  </CustomLink>
)

export const NotificationsBell = ({ unreadCount }: NotificationsProps) => {
  const myAddress = useMyAddress()
  const isInitialized = useMyAccount(state => state.isInitialized)
  const { getLastReadNotif } = useNotifCounterContext()

  if (!enableNotifications) return null
  if (!unreadCount || unreadCount <= 0 || !isInitialized) return <Bell unreadCount={unreadCount} />

  const showWithoutCount = !getLastReadNotif(myAddress)

  return (
    <Badge
      count={showWithoutCount ? ' ' : unreadCount}
      size={showWithoutCount ? 'small' : 'default'}
      offset={showWithoutCount ? [-3, 1] : undefined}
      className={clsx(unreadCount && 'mr-4', styles.DfNotifCounter)}
    >
      <Bell unreadCount={showWithoutCount ? 0 : unreadCount} />
    </Badge>
  )
}
