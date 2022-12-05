import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import config from 'src/config'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, bnsToIds, SpaceId } from 'src/types'
import { fetchFeedByAccount } from '../posts/myFeedSlice'

type Entity = {
  /** `id` is an account address id that follows spaces. */
  id: AccountId
  followedSpaceIds: SpaceId[]
}

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

const selectors = adapter.getSelectors<RootState>(state => state.followedSpaceIds)

export const selectEntityOfSpaceIdsByFollower: SelectOneFn<Args, MaybeEntity> = (
  state,
  { id: follower },
) => selectors.selectById(state, follower)

export const selectSpaceIdsByFollower = (state: RootState, id: AccountId) =>
  selectEntityOfSpaceIdsByFollower(state, { id })?.followedSpaceIds

type Args = {}

type FetchOneSpaceIdsArgs = FetchOneArgs<Args>

export const fetchEntityOfSpaceIdsByFollower = createAsyncThunk<
  MaybeEntity,
  FetchOneSpaceIdsArgs,
  ThunkApiConfig
>('followedSpaceIds/fetchOne', async (args, { getState, dispatch }): Promise<MaybeEntity> => {
  const { api, id, reload } = args

  const follower = id as AccountId
  const knownSpaceIds = selectSpaceIdsByFollower(getState(), follower)
  const isKnownFollower = typeof knownSpaceIds !== 'undefined'
  if (!reload && isKnownFollower) {
    // Nothing to load: space ids followed by this account are already loaded.
    return undefined
  }

  const spaceIds = bnsToIds(await api.blockchain.spaceIdsFollowedByAccount(follower))

  config.enableOnchainActivities && dispatch(fetchFeedByAccount({ ...args, spaceIds }))

  return {
    id: follower,
    followedSpaceIds: spaceIds,
  }
})

const slice = createSlice({
  name: 'followedSpaceIds',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertFollowedSpaceIdsByAccount: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchEntityOfSpaceIdsByFollower.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  },
})

export const { upsertFollowedSpaceIdsByAccount } = slice.actions

export default slice.reducer
