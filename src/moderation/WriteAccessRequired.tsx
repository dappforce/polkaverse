// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { FC } from 'react'
import NotAuthorized from 'src/components/auth/NotAuthorized'
import NoWriteAccess from 'src/components/auth/NoWriteAccess'

import { useAmIBlocked, useIsSignedIn } from 'src/components/auth/MyAccountsContext'

/** The current user should be signed in and not blocked by moderation. */
export const WriteAccessRequired: FC<{}> = ({ children }) => {
  const isSignedIn = useIsSignedIn()
  const isBlocked = useAmIBlocked()

  if (!isSignedIn) return <NotAuthorized />

  if (isBlocked) return <NoWriteAccess />

  return <>{children}</>
}
