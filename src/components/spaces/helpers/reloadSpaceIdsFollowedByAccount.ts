import { SubsocialSubstrateApi } from '@subsocial/api'
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
  const res = await readyApi.query.spaceFollows.spacesFollowedByAccount(account)
  const followedSpaceIds = bnsToIds(res)
  // console.log('reloadSpaceIdsIFollow: Updated space ids followed by account:', account, followedSpaceIds)

  dispatch(
    upsertFollowedSpaceIdsByAccount({
      id: account,
      followedSpaceIds,
    }),
  )
}
