// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { BTreeSet, Option } from '@polkadot/types'
import {
  SpacePermissions as ISpacePermissions,
  SpacePermissionSet as ISpacePermissionSet,
} from '@subsocial/api/types/substrate'
import { BuiltInRole } from './utils'
export const SpacePermissionSet = BTreeSet.with('SpacePermission')

export type OptionSpacePermission = Option<ISpacePermissions>

type OptionSpacePermissionSet = ISpacePermissionSet | null

export type SpacePermissionsType = {
  none: OptionSpacePermissionSet
  everyone: OptionSpacePermissionSet
  follower: OptionSpacePermissionSet
  space_owner: OptionSpacePermissionSet
}

const createWritePermission = () => {
  return [
    'CreatePosts',
    'UpdateOwnPosts',
    'DeleteOwnPosts',
    'HideOwnPosts',
    'UpdateOwnSubspaces',
    'DeleteOwnSubspaces',
    'HideOwnSubspaces',
    'CreateComments',
    'UpdateOwnComments',
    'DeleteOwnComments',
    'HideOwnComments',
    'Upvote',
    'Downvote',
    'Share',
  ] as unknown as ISpacePermissionSet
}

export const newWritePermission = (type?: BuiltInRole, currentType?: BuiltInRole) => {
  if (!currentType) {
    currentType = 'space_owner'
  }

  if (!type) {
    type = currentType
  }

  const nonePermissions = null

  const permissionsObj: SpacePermissionsType = {
    none: nonePermissions,
    everyone: nonePermissions,
    follower: nonePermissions,
    space_owner: nonePermissions,
  }

  if (type !== 'space_owner') {
    permissionsObj[type] = createWritePermission()
  }

  return permissionsObj as unknown as ISpacePermissions
}
