// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { SpaceStruct } from 'src/types'

export type BuiltInRole = 'none' | 'everyone' | 'follower' | 'space_owner'

export const getWhoCanPost = (space?: SpaceStruct): BuiltInRole => {
  if (!space) return 'space_owner'

  const { canEveryoneCreatePosts, canFollowerCreatePosts } = space

  if (canFollowerCreatePosts) return 'follower'

  if (canEveryoneCreatePosts) return 'everyone'

  return 'space_owner'
}
