// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useMyAddress } from '../auth/MyAccountsContext'
import NotAuthorized from '../auth/NotAuthorized'
import { PageContent } from '../main/PageWrapper'
import { Notifications } from './Notifications'
import styles from './style.module.sass'

const NOTIFICATION_TITLE = 'My notifications'

export const MyNotifications = () => {
  const myAddress = useMyAddress()

  if (!myAddress) return <NotAuthorized />

  return (
    <PageContent meta={{ title: NOTIFICATION_TITLE }} className={styles.NotificationPage}>
      <Notifications title={NOTIFICATION_TITLE} address={myAddress} />
    </PageContent>
  )
}

export default MyNotifications
