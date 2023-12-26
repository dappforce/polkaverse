import { AccountId, PostId, PostWithSomeDetails, SpaceWithSomeDetails } from 'src/types'

export type ViewSpaceOptsProps = {
  nameOnly?: boolean
  miniPreview?: boolean
  previewWithoutBorder?: boolean
  preview?: boolean
  dropdownPreview?: boolean
  withLink?: boolean
  withFollowButton?: boolean
  withTags?: boolean
  withStats?: boolean
  showFullAbout?: boolean
  imageSize?: number
}

export type ViewSpaceProps = ViewSpaceOptsProps & {
  spaceData?: SpaceWithSomeDetails
  postIds?: PostId[]
  posts?: PostWithSomeDetails[]
  followers?: AccountId[]

  onClick?: () => void
  statusCode?: number
}
