// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useRouter } from 'next/router'
import React from 'react'
import { MaintenancePage } from 'src/components/posts/view-post'
import { enableMaintenancePage } from 'src/config/env'
import ClientLayout from './ClientLayout'

const Page: React.FunctionComponent = ({ children }) => <div className='mb-3'>{children}</div>

const SKIP_LAYOUT_PAGES = 'generators-for-promo'

const NextLayout: React.FunctionComponent = props => {
  const router = useRouter()
  if (enableMaintenancePage) return <MaintenancePage />

  if (router.pathname.includes(SKIP_LAYOUT_PAGES)) return <Page {...props} />

  return (
    <ClientLayout>
      <Page {...props} />
    </ClientLayout>
  )
}

export default NextLayout
