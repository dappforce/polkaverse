// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import Link from 'next/link'
import React from 'react'
import { BareProps } from 'src/components/utils/types'

type Props = BareProps & {
  title?: React.ReactNode
}

export const AllSpacesLink = ({ title = 'See all', ...otherProps }: Props) => (
  <Link href='/spaces' as='/spaces'>
    <a className='DfGreyLink text-uppercase' style={{ fontSize: '1rem' }} {...otherProps}>
      {title}
    </a>
  </Link>
)
