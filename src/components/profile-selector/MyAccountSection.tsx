// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { SignOutButton } from 'src/components/auth/AuthButtons'
import { AccountSelector } from './AccountSelector'
// import PrivacyPolicyLinks from '../utils/PrivacyPolicyLinks'
import { Divider } from 'antd'

export const MyAccountSection = () => {
  return (
    <div>
      <AccountSelector />
      <Divider className='mb-3 mt-0' />
      <SignOutButton />
      {/* <Divider className='mt-3 mb-0' />
    <PrivacyPolicyLinks /> */}
    </div>
  )
}

export default MyAccountSection
