import clsx from 'clsx'
import ChatIframe from './ChatIframe'
import styles from './ChatSidePanel.module.sass'

export default function ChatSidePanel() {
  return (
    <div className={clsx(styles.ChatSidePanel)}>
      <ChatIframe className={clsx(styles.ChatIframe)} />
    </div>
  )
}
