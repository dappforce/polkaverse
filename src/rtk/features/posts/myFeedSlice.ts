import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, idToBn, PostId, SpaceId } from 'src/types'
import { descSortIds } from 'src/utils'

type Entity = {
  /** `id` is an account address that owns posts. */
  id: AccountId
  myFeed: PostId[]
}

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

const selectors = adapter.getSelectors<RootState>(state => state.myFeed)

type Args = {
  spaceIds?: SpaceId[]
}

export const selectEntityOfPostIdsByOwner: SelectOneFn<Args, MaybeEntity> = (
  state,
  { id: myAddress },
) => selectors.selectById(state, myAddress)

export const selectFeedByAccount = (state: RootState, id: AccountId) =>
  selectEntityOfPostIdsByOwner(state, { id })?.myFeed

type FetchOnePostIdsArgs = FetchOneArgs<Args>

export const fetchFeedByAccount = createAsyncThunk<
  MaybeEntity,
  FetchOnePostIdsArgs,
  ThunkApiConfig
>('myFeed/fetchOne', async ({ api, id, spaceIds, reload }, { getState }): Promise<MaybeEntity> => {
  const myAddress = id as AccountId
  const knownPostIds = selectFeedByAccount(getState(), myAddress)
  const isKnownOwner = typeof knownPostIds !== 'undefined'
  if (!reload && isKnownOwner) {
    // Nothing to load: post ids owned by this account are already loaded.
    return undefined
  }

  const promises =
    spaceIds?.map(async spaceId => api.blockchain.postIdsBySpaceId(idToBn(spaceId))) || []
  const postIds = (await Promise.all(promises)).flat()

  return {
    id: myAddress,
    myFeed: descSortIds(postIds),
  }
})

const slice = createSlice({
  name: 'myFeed',
  initialState: adapter.getInitialState(),
  reducers: {
    // upsertOwnPostIds: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchFeedByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  },
})

export const {
  // upsertOwnPostIds,
} = slice.actions

export default slice.reducer
