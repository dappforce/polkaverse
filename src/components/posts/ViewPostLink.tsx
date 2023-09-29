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
    <Link href='/[spaceId]/[slug]' as={postUrl(space, post)} legacyBehavior>
      <a className={className} title={hint}>
        {title}
      </a>
    </Link>
  )
})

export default ViewPostLink
