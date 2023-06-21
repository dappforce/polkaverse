// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import Link from 'next/link'
import React from 'react'
import { SpaceStruct } from 'src/types'
import { spaceUrl } from '../urls'

type Props = {
  space: SpaceStruct
  title?: React.ReactNode
  hint?: string
  className?: string
  containerClassName?: string
}

export const ViewSpaceLink = React.memo(
  ({ space, title, hint, className, containerClassName }: Props) => {
    if (!space.id || !title) return null

    return (
      <span
        className={containerClassName}
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        <Link href='/[spaceId]' as={spaceUrl(space)}>
          <a className={'DfBlackLink ' + className} title={hint}>
            {title}
          </a>
        </Link>
      </span>
    )
  },
)

export default ViewSpaceLink
