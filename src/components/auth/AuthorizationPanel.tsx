import { Button } from 'antd'
import { NotificationsBell, useNotifCounterContext } from '../activity/NotifCounter'
import { NewPostButtonInTopMenu } from '../posts/NewPostButtonInTopMenu'
import { MyAccountPopup } from '../profiles/address-views'
import { useMyAddress } from './MyAccountsContext'

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
        <a href='/c/widget/login'>
          <Button type='default'>Sign in</Button>
        </a>
      )}
    </>
  )
}

export default AuthorizationPanel
