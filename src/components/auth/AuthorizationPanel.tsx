import { Button } from 'antd'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { getCurrentUrlOrigin } from 'src/utils/url'
import urlJoin from 'src/utils/url-join'
import { NotificationsBell, useNotifCounterContext } from '../activity/NotifCounter'
import { NewPostButtonInTopMenu } from '../posts/NewPostButtonInTopMenu'
import { MyAccountPopup } from '../profile-selector/MyAccountMenu'
import { isServerSide } from '../utils'
import { useMyAddress } from './MyAccountsContext'

function getCurrentPathanme() {
  if (isServerSide()) return ''
  return encodeURIComponent(window.location.href.replace(getCurrentUrlOrigin(), ''))
}

export const AuthorizationPanel = () => {
  const address = useMyAddress()
  const { unreadCount } = useNotifCounterContext()
  const sendEvent = useSendEvent()

  return (
    <>
      {address ? (
        <>
          <NewPostButtonInTopMenu />
          <NotificationsBell unreadCount={unreadCount} />
          <MyAccountPopup className='profileName' />
        </>
      ) : (
        <a
          href={urlJoin('/c/widget/login', `?from=${getCurrentPathanme()}`)}
          onClick={() => sendEvent('login_button_clicked', { eventSource: 'polkaverse-ui-navbar' })}
        >
          <Button type='default'>Sign in</Button>
        </a>
      )}
    </>
  )
}

export default AuthorizationPanel
