import { Button, notification } from 'antd'
import { disableGa, enableGa, readCookies } from '../../ga/utils'
import styles from './index.module.sass'

export const openCookiesNotification = () => {
  const cookies = readCookies()

  if (cookies !== undefined) return

  const key = 'CookiesNotification'

  const onAccept = () => {
    notification.close(key)
    enableGa()
  }

  const onDecline = () => {
    notification.close(key)
    disableGa()
  }

  const action = (
    <div className='d-flex justify-content-between'>
      <Button onClick={onDecline}>Decline</Button>
      <Button type='primary' onClick={onAccept}>
        Accept
      </Button>
    </div>
  )

  notification.open({
    message: 'Cookies policy',
    description:
      "We use necessary cookies to make our site work. We'd also like to set optional tracking mechanisms to help us improve it by collecting and reporting information on how you use it.",
    btn: action,
    key,
    placement: 'bottomRight',
    duration: 0,
    className: styles.CookiesNotification,
  })
}
