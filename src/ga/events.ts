// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import ga from 'react-ga'
import { useIsSignedIn } from 'src/components/auth/MyAccountsContext'
import categories from './category'

type CreateEventProps = {
  category: string
  action: string
}

export const sendGaEvent = (props: CreateEventProps) => {
  ga.event(props)
}

export const sendGuestGaEvent = (action: string) =>
  sendGaEvent({
    category: categories.user.guest,
    action,
  })

export const sendSignedInGaEvent = (action: string) =>
  sendGaEvent({
    category: categories.user.signin,
    action,
  })

export const useSendGaUserEvent = () => {
  const isSignIn = useIsSignedIn()
  const sendGAEvent = isSignIn ? sendSignedInGaEvent : sendGuestGaEvent

  return sendGAEvent
}

export const useCreateSendGaUserEvent = (action: string) => {
  const sendGaEvent = useSendGaUserEvent()

  return () => sendGaEvent(action)
}
