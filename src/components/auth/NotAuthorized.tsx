import { Button } from 'antd'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { redirectToLogin } from 'src/utils/url'
import NoData from '../utils/EmptyList'

export const NotAuthorized = () => {
  const sendEvent = useSendEvent()
  return (
    <NoData description='Only signed in users can access this page'>
      <Button
        onClick={() => {
          redirectToLogin()
          sendEvent('login_button_clicked', { eventSource: 'polkaverse-ui-not-authorized' })
        }}
      >
        Sign in
      </Button>
    </NoData>
  )
}

export default NotAuthorized
