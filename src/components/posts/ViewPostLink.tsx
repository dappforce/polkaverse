// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import Link from 'next/link'
import React from 'react'
import { SpaceStruct } from 'src/types'
import { HasDataForSlug, postUrl } from '../urls'

type Props = {
  post: HasDataForSlug
  space?: SpaceStruct
  title?: React.ReactNode
  hint?: string
  className?: string
}

export const ViewPostLink = React.memo(({ space, post, title, hint, className }: Props) => {
  if (!post.struct.id || !title) return null

  return (
    <Link href='/[spaceId]/[slug]' as={postUrl(space, post)}>
      <a className={className} title={hint}>
        {title}
      </a>
    </Link>
  )
})

export default ViewPostLink
