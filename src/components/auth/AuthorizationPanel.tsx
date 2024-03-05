import { Button } from 'antd'
import { getCurrentUrlOrigin } from 'src/utils/url'
import urlJoin from 'src/utils/url-join'
import { NotificationsBell, useNotifCounterContext } from '../activity/NotifCounter'
import { NewPostButtonInTopMenu } from '../posts/NewPostButtonInTopMenu'
import { MyAccountPopup } from '../profiles/address-views'
import { isServerSide } from '../utils'
import { useMyAddress } from './MyAccountsContext'

function getCurrentPathanme() {
  if (isServerSide()) return ''
  return encodeURIComponent(window.location.href.replace(getCurrentUrlOrigin(), ''))
}

export const AuthorizationPanel = () => {
  const address = useMyAddress()
  const { unreadCount } = useNotifCounterContext()

  return (
    <>
      {address ? (
        <>
          <NewPostButtonInTopMenu />
          <NotificationsBell unreadCount={unreadCount} />
          <MyAccountPopup className='profileName' />
        </>
      ) : (
        <a href={urlJoin('/c/widget/login', `?from=${getCurrentPathanme()}`)}>
          <Button type='default'>Sign in</Button>
        </a>
      )}
    </>
  )
}

export default AuthorizationPanel
