// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import TxButton from './TxButton'

export const FollowButtonStub = React.memo(() => (
  <TxButton
    type='primary'
    ghost={true}
    label='Follow'
    tx={'spaceFollows.followSpace'}
    params={[]}
  />
))
