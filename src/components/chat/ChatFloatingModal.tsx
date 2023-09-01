import { Button } from 'antd'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HiChevronDown } from 'react-icons/hi2'
import { useResponsiveSize } from '../responsive'
import styles from './ChatFloatingModal.module.sass'
import ChatIframe from './ChatIframe'
// import { useResponsiveSize } from '../responsive'
// import { useSendEvent } from '../providers/AnalyticContext'

export default function ChatFloatingModal() {
  const { isLargeDesktop } = useResponsiveSize()
  // const sendEvent = useSendEvent()

  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const unreadCountFromStorage = parseInt(localStorage.getItem('unreadCount') ?? '')
    if (unreadCountFromStorage && !isNaN(unreadCountFromStorage)) {
      setUnreadCount(unreadCountFromStorage)
    }
  }, [])

  const hasOpened = useRef(false)
  const toggleChat = () => {
    // let event
    if (isOpen) {
      // event = 'close_grill_iframe'
    } else {
      // event = 'open_grill_iframe'
      setUnreadCount(0)
      localStorage.setItem('unreadCount', '0')
    }
    // sendEvent(event)

    setIsOpen(prev => !prev)
    hasOpened.current = true
  }

  if (isLargeDesktop) {
    return null
  }

  const onUnreadCountChange = (count: number) => {
    if (count > 0) {
      setUnreadCount(count)
      localStorage.setItem('unreadCount', count.toString())
    }
  }

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
            <span>Comment article</span>
          </Button>
          {!!unreadCount && <span className={styles.ChatUnreadCount}>{unreadCount}</span>}
        </div>,
        document.body,
      )}
    </>
  )
}
