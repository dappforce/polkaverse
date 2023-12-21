import { Button } from 'antd'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HiChevronDown } from 'react-icons/hi2'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useChatOpenState } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { ChatEntity } from 'src/rtk/features/chat/chatSlice'
import { disablePageScroll, enablePageScroll } from 'src/utils/window'
import styles from './ChatFloatingModal.module.sass'
import ChatIframe from './ChatIframe'

export default function ChatFloatingModal() {
  const sendEvent = useSendEvent()
  const [isOpen, setIsOpen] = useChatOpenState()
  const entity = useAppSelector(state => state.chat.entity)

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!entity) return

    const unreadCountFromStorage = getUnreadCount(entity)
    if (unreadCountFromStorage && !isNaN(unreadCountFromStorage)) {
      setUnreadCount(unreadCountFromStorage)
    }
  }, [entity])

  const hasOpened = useRef(false)
  const toggleChat = () => {
    let event
    if (isOpen) {
      event = 'close_grill_iframe'
    } else {
      event = 'open_grill_iframe'
      setUnreadCount(0)
      if (entity) saveUnreadCount(entity, 0)
    }
    sendEvent(event)

    if (!isOpen) disablePageScroll()
    else enablePageScroll()

    setIsOpen(!isOpen)
    hasOpened.current = true
  }

  const onUnreadCountChange = (count: number) => {
    if (count > 0 && entity) {
      setUnreadCount(count)
      saveUnreadCount(entity, count)
    }
  }

  if (!entity) return null

  return (
    <>
      {createPortal(
        <div className={clsx(styles.ChatContainer, !isOpen && styles.ChatContainerHidden)}>
          <div className={clsx(styles.ChatOverlay)} onClick={() => setIsOpen(false)} />
          <div className={clsx(styles.ChatContent)}>
            <div className={clsx(styles.ChatControl)}>
              <Button onClick={toggleChat}>
                <HiChevronDown />
              </Button>
            </div>
            <ChatIframe onUnreadCountChange={onUnreadCountChange} className={styles.ChatIframe} />
          </div>
        </div>,
        document.body,
      )}
      {createPortal(
        <div className={styles.ChatFloatingWrapper}>
          <Button className={styles.ChatFloatingButton} onClick={toggleChat}>
            <img src='/images/grillchat.svg' alt='GrillChat' />
            <span>Comments</span>
          </Button>
          {!!unreadCount && <span className={styles.ChatUnreadCount}>{unreadCount}</span>}
        </div>,
        document.body,
      )}
    </>
  )
}

type Entity = NonNullable<ChatEntity['entity']>
function getUnreadCount(entity: Entity) {
  return parseInt(localStorage.getItem(`unreadCount:${entity.type}:${entity.data.id}`) ?? '') ?? 0
}

function saveUnreadCount(entity: Entity, count: number) {
  localStorage.setItem(`unreadCount:${entity.type}:${entity.data.id}`, count.toString() ?? '0')
}
