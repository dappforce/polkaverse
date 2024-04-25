// import { NotificationsBell, useNotifCounterContext } from '../activity/NotifCounter'
// import EnergyDropdown from '../energy/index'
import { NewPostButtonInTopMenu } from '../posts/NewPostButtonInTopMenu'
import { MyAccountPopup } from '../profiles/address-views'
import { SignInButton } from './AuthButtons'
import { useMyAddress } from './MyAccountsContext'

export const AuthorizationPanel = () => {
  const address = useMyAddress()
  // const { unreadCount } = useNotifCounterContext()

  return (
    <>
      {address ? (
        <>
          <NewPostButtonInTopMenu />
          {/*<NotificationsBell unreadCount={unreadCount} />*/}
          {/*<EnergyDropdown />*/}
          <MyAccountPopup className='profileName' />
        </>
      ) : (
        <SignInButton className={'mr-2'} />
      )}
    </>
  )
}

export default AuthorizationPanel
