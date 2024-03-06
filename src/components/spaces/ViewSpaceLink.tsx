import React, { CSSProperties } from 'react'
import { SpaceStruct } from 'src/types'
import CustomLink from '../referral/CustomLink'
import { spaceUrl } from '../urls'

type Props = {
  space: SpaceStruct
  title?: React.ReactNode
  hint?: string
  className?: string
  containerClassName?: string
  style?: CSSProperties
  containerStyle?: CSSProperties
}

export const ViewSpaceLink = React.memo(
  ({ space, title, hint, className, containerClassName, containerStyle, style }: Props) => {
    if (!space.id || !title) return null

    return (
      <span
        className={containerClassName}
        style={containerStyle}
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        <CustomLink href='/[spaceId]' as={spaceUrl(space)}>
          <a className={'DfBlackLink ' + className} style={style} title={hint}>
            {title}
          </a>
        </CustomLink>
      </span>
    )
  },
)

export default ViewSpaceLink
