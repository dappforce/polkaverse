import React from 'react'
import { SpaceStruct } from 'src/types'
import CustomLink from '../referral/CustomLink'
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
    <CustomLink
      href='/[spaceId]/[slug]'
      as={postUrl(space, post)}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <a className={className} title={hint}>
        {title}
      </a>
    </CustomLink>
  )
})

export default ViewPostLink
