// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import dynamic from 'next/dynamic'
import { PageNotFound } from 'src/components/utils'
import config from 'src/config'
const MyNotifications = dynamic(() => import('../components/activity/MyNotifications'), {
  ssr: false,
})

export const page = () => <MyNotifications />

export default config.enableNotifications ? page : PageNotFound
