// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { PostContent, PostStruct, SpaceContent, SpaceStruct } from '@subsocial/api/types'
import { ProfileSpaceIdByAccount } from 'src/types'

// Simple Fragment Results
export type SpaceSimpleFragmentMapped = SpaceStruct & { ipfsContent?: SpaceContent }
export type PostSimpleFragmentMapped = PostStruct & {
  originalPostId?: string
  rootPostId?: string
} & { ipfsContent?: PostContent }
export type ProfileSimpleFragmentMapped = ProfileSpaceIdByAccount

// Full Fragment Results
export type ProfileFragmentMapped = ProfileSimpleFragmentMapped & {
  profileSpace: SpaceSimpleFragmentMapped | null
}
export type SpaceFragmentMapped = SpaceSimpleFragmentMapped & {
  ownedByAccount: ProfileFragmentMapped
}

export type PostFragmentMapped = PostSimpleFragmentMapped & {
  space: SpaceFragmentMapped | null
  ownedByAccount: ProfileFragmentMapped | null
}
export type PostFragmentWithParent = PostFragmentMapped & {
  parentPost: PostFragmentMapped | null
  sharedPost: PostFragmentMapped | null
}
