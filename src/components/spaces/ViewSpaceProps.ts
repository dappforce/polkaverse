// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
  withTipButton?: boolean
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
