// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import NoData from '../utils/EmptyList'
import { SignInButton } from './AuthButtons'

export const NotAuthorized = () => (
  <NoData description='Only signed in users can access this page'>
    <SignInButton />
  </NoData>
)

export default NotAuthorized
