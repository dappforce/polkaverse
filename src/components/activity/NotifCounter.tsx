import { BellOutlined } from '@ant-design/icons'
import { Badge } from 'antd'
import clsx from 'clsx'
import React, { createContext, useContext, useEffect, useState } from 'react'
import config from 'src/config'
import { useGetNotificationsCount } from 'src/graphql/hooks'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { useMyAddress } from '../auth/MyAccountsContext'
import CustomLink from '../referral/CustomLink'
import styles from './style.module.sass'

const { enableNotifications } = config

export type UpdateLastReadNotificationFn = (lastReadDate: string) => void
export type NotifCounterContextProps = {
  unreadCount: number
  lastReadNotif: string | undefined
  updateLastReadNotification: UpdateLastReadNotificationFn
}

export const NotifCounterContext = createContext<NotifCounterContextProps>({
  unreadCount: 0,
  lastReadNotif: undefined,
  updateLastReadNotification: {} as any,
})

const LAST_READ_NOTIFICATION_KEY = 'lastReadNotification'

function InnerNotifCounterProvider(props: React.PropsWithChildren<{}>) {
  const { data: lastReadNotif, setData: setLastReadNotif } = useExternalStorage(
    LAST_READ_NOTIFICATION_KEY,
    { storageKeyType: 'user' },
  )
  const myAddress = useMyAddress()

  const [unreadCount, setUnreadCount] = useState(0)
  const getNotificationsCount = useGetNotificationsCount()
  const updateLastReadNotification = (newLastRead: string) => {
    if (!myAddress) return
    setUnreadCount(0)
    if (!lastReadNotif || new Date(lastReadNotif) < new Date(newLastRead)) {
      setLastReadNotif(newLastRead)
    }
  }

  useEffect(() => {
    ;(async () => {
      if (!myAddress || lastReadNotif === undefined) return
      const unreadCount = await getNotificationsCount({
        address: myAddress,
        afterDate: lastReadNotif || undefined,
      })
      setUnreadCount(unreadCount)
    })()
  }, [lastReadNotif, myAddress])

  return (
    <NotifCounterContext.Provider
      value={{ unreadCount, lastReadNotif, updateLastReadNotification }}
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
  icon: <BellOutlined className='bell d-block' />,
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
  const { lastReadNotif } = useNotifCounterContext()

  if (!enableNotifications) return null
  if (!unreadCount || unreadCount <= 0) return <Bell unreadCount={unreadCount} />

  const showWithoutCount = !lastReadNotif

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
