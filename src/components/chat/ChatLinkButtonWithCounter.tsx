import { PostData } from '@subsocial/api/types'
import { Button } from 'antd'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { useSetChatEntityConfig, useSetChatOpen } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { useSendEvent } from 'src/stores/analytics'
import { getUnreadCount } from './ChatFloatingModal'
import styles from './ChatIframe.module.sass'

type ChatLinkButtonWithCounterProps = {
  post: PostData
}

const ChatLinkButtonWithCounter = ({ post }: ChatLinkButtonWithCounterProps) => {
  const setChatConfig = useSetChatEntityConfig()
  const setChatOpen = useSetChatOpen()
  const sendEvent = useSendEvent()

  const entity = useAppSelector(state => state.chat.entity)

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!entity) return

    const unreadCountFromStorage = getUnreadCount(entity)
    if (unreadCountFromStorage && !isNaN(unreadCountFromStorage)) {
      setUnreadCount(unreadCountFromStorage)
    }
  }, [entity])

  return (
    <span className={styles.ButtonWrapper}>
      <Button
        onClick={() => {
          setChatConfig({
            entity: { type: 'post', data: post },
            withFloatingButton: false,
          })
          setChatOpen(true)

          sendEvent('open_chat_clicked', { eventSource: 'profile_page' })
        }}
        type='link'
        className={styles.ChatButton}
      >
        Chat
        <div className={clsx(styles.ChatUnreadCount)}>{unreadCount ? unreadCount : 'New'}</div>
      </Button>
    </span>
  )
}

export default ChatLinkButtonWithCounter
