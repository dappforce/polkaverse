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
