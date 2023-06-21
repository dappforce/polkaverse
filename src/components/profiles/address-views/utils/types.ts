// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import { AnyAccountId, ProfileData } from 'src/types'

export type AddressProps = {
  className?: string
  style?: React.CSSProperties
  address: AnyAccountId
  owner?: ProfileData
}

export type ExtendedAddressProps = AddressProps & {
  children?: React.ReactNode
  afterName?: JSX.Element
  details?: JSX.Element
  isPadded?: boolean
  isShort?: boolean
  size?: number
  withFollowButton?: boolean
  spaceId?: string
}
