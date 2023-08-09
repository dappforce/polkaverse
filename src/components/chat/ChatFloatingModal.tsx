import clsx from 'clsx'
import { useEffect, useRef } from 'react'
import { useChatWindowOpenState, useOpenCloseChatWindow } from 'src/rtk/app/hooks'
import styles from './ChatFloatingModal.module.sass'

export default function ChatFloatingModal() {
  const isOpen = useChatWindowOpenState()
  const setChatWindowState = useOpenCloseChatWindow()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutSideClick = (event: any) => {
      console.log(isOpen)
      if (!ref.current?.contains(event.target) && isOpen) {
        setChatWindowState(false)
      }
    }

    window.addEventListener('mousedown', handleOutSideClick)

    return () => {
      window.removeEventListener('mousedown', handleOutSideClick)
    }
  }, [ref])

  return (
    <div className={styles.ChatFloatingModal}>
      {isOpen && (
        <div
          id='grill'
          ref={ref}
          className={clsx(styles.ChatFloatingIframe, !isOpen && styles.ChatFloatingIframeHidden)}
        />
      )}
    </div>
  )
}
