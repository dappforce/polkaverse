import { useMyAccount } from 'src/stores/my-account'
import { useMyAddress } from '../auth/MyAccountsContext'
import NotAuthorized from '../auth/NotAuthorized'
import { PageContent } from '../main/PageWrapper'
import { Loading } from '../utils'
import { Notifications } from './Notifications'
import styles from './style.module.sass'

const NOTIFICATION_TITLE = 'My notifications'

export const MyNotifications = () => {
  const myAddress = useMyAddress()
  const isInitialized = useMyAccount(state => state.isInitialized)

  if (!myAddress) return <NotAuthorized />

  return (
    <PageContent meta={{ title: NOTIFICATION_TITLE }} className={styles.NotificationPage}>
      {!isInitialized ? (
        <Loading center />
      ) : (
        <Notifications title={NOTIFICATION_TITLE} address={myAddress} />
      )}
    </PageContent>
  )
}

export default MyNotifications
