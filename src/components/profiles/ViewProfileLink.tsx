// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import Link from 'next/link'
import React from 'react'
import { accountUrl, HasAddress } from '../urls'

type Props = {
  account: HasAddress
  title?: React.ReactNode
  hint?: string
  className?: string
}

export const ViewProfileLink = React.memo(({ account, title, hint, className }: Props) => {
  const { address } = account

  if (!address) return null

  return (
    <Link href='/accounts/[address]' as={accountUrl(account)}>
      <a className={className} title={hint}>
        {title || address.toString()}
      </a>
    </Link>
  )
})

export default ViewProfileLink
