import Link from 'next/link'
import React from 'react'
import { SpaceStruct } from 'src/types'
import { spaceUrl } from '../urls'

type Props = {
  space: SpaceStruct
  title?: React.ReactNode
  hint?: string
  className?: string
}

export const ViewSpaceLink = React.memo(({ space, title, hint, className }: Props) => {
  if (!space.id || !title) return null

  return (
    <span
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
})

export default ViewSpaceLink
