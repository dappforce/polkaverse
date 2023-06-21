// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { getFirstOrUndefined, idToBn, isEmptyArray, isEmptyStr } from '@subsocial/utils'
import { createSelectUnknownIds, FetchManyArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectManyFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, SpaceId, SpacePermissionKey } from 'src/types'

const sliceName = 'permissions'

const idSeparator = '-'

// A composite entity id: account_id + '-' + post_id
type AccountAndSpaceId = string

export type PermissionStruct = {
  id: AccountAndSpaceId
  permissions: SpacePermissionKey[]
}

type Args = {
  myAddress?: AccountId
}

type PrependParams = Args & {
  ids: EntityId[]
}

export const prependSpaceIdWithMyAddress = (spaceId: EntityId, myAddress: AccountId) =>
  (spaceId as string).startsWith(myAddress)
    ? (spaceId as string)
    : myAddress + idSeparator + spaceId

const prependSpaceIdsWithMyAddress = ({ ids: spaceIds, myAddress }: PrependParams) =>
  myAddress ? spaceIds.map(spaceId => prependSpaceIdWithMyAddress(spaceId, myAddress)) : []

const adapter = createEntityAdapter<PermissionStruct>()

const selectors = adapter.getSelectors<RootState>(state => state.mySpacePermissions)

// Rename for readability
const { selectIds: selectAllEntityIds } = selectors

export const selectMyPermissionsBySpaceIds: SelectManyFn<Args, PermissionStruct> = (
  state,
  { myAddress, ids: spaceIds },
) => {
  if (!myAddress || isEmptyStr(myAddress) || isEmptyArray(spaceIds)) return []

  const permissions: PermissionStruct[] = []

  spaceIds.forEach(spaceId => {
    const compositeId = prependSpaceIdWithMyAddress(spaceId, myAddress)
    const permission = selectors.selectById(state, compositeId)
    if (permission) {
      permissions.push(permission)
    }
  })

  return permissions
}

type SpaceIdAndMyAddress = {
  spaceId: SpaceId
  myAddress?: AccountId
}

export const selectMyPermissionsBySpaceId = (
  state: RootState,
  { spaceId, myAddress }: SpaceIdAndMyAddress,
) => getFirstOrUndefined(selectMyPermissionsBySpaceIds(state, { ids: [spaceId], myAddress }))

type FetchManyPermissionsArgs = FetchManyArgs<Args>

type FetchManyResult = PermissionStruct[]

const selectUnknownEntityIds = createSelectUnknownIds(selectAllEntityIds)

export const fetchMyPermissionsBySpaceIds = createAsyncThunk<
  FetchManyResult,
  FetchManyPermissionsArgs,
  ThunkApiConfig
>(`${sliceName}/fetchMany`, async (args, { getState }): Promise<FetchManyResult> => {
  const { myAddress, api, reload } = args

  if (!myAddress) return []

  let newIds = prependSpaceIdsWithMyAddress(args)

  if (!reload) {
    newIds = selectUnknownEntityIds(getState(), newIds)
    if (!newIds.length) {
      // Nothing to load: all ids are known and their permissions are already loaded.
      return []
    }
  }

  const promises = newIds.map(async accountAndSpaceId => {
    const [, /* account */ spaceId] = accountAndSpaceId.split(idSeparator)
    const permissions =
      (await api.blockchain.getSpacePermissionsByAccount(myAddress, idToBn(spaceId))) || []

    return {
      id: prependSpaceIdWithMyAddress(spaceId, myAddress),
      permissions,
    }
  })

  return Promise.all(promises)
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    upsertMySpacePermissions: adapter.upsertOne,
    // removeAllPermissions: adapter.removeAll
  },
  extraReducers: builder => {
    builder.addCase(fetchMyPermissionsBySpaceIds.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertMany(state, payload)
    })
  },
})

export const {
  upsertMySpacePermissions,
  // removeAllPermissions
} = slice.actions

export default slice.reducer
