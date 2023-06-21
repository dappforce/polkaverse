// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Vec } from '@polkadot/types'
import { SubsocialSubstrateApi } from '@subsocial/api'
import { SpaceId as SubstrateSpaceId } from '@subsocial/api/types/substrate'
import { AppDispatch } from 'src/rtk/app/store'
import { upsertFollowedSpaceIdsByAccount } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import { AccountId, bnsToIds } from 'src/types'

type ReploadSpaceIds = {
  substrate: SubsocialSubstrateApi
  dispatch: AppDispatch
  account: AccountId
}

export const reloadSpaceIdsFollowedByAccount = async (props: ReploadSpaceIds) => {
  const { substrate, dispatch, account } = props

  // console.log('reloadSpaceIdsIFollow')

  const readyApi = await substrate.api
  const res = (await readyApi.query.spaceFollows.spacesFollowedByAccount(
    account,
  )) as Vec<SubstrateSpaceId>
  const followedSpaceIds = bnsToIds(res)
  // console.log('reloadSpaceIdsIFollow: Updated space ids followed by account:', account, followedSpaceIds)

  dispatch(
    upsertFollowedSpaceIdsByAccount({
      id: account,
      followedSpaceIds,
    }),
  )
}
