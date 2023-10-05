import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, AnySpaceId, idToBn, PostId } from 'src/types'
import { descSort } from 'src/utils'

type Entity = {
  /** `id` is an account address that owns posts. */
  id: AccountId
  ownPostIds: PostId[]
}

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

const selectors = adapter.getSelectors<RootState>(state => state.ownPostIds)

type Args = {
  spaceIds?: AnySpaceId[]
}

export const selectEntityOfPostIdsByOwner: SelectOneFn<Args, MaybeEntity> = (
  state,
  { id: myAddress },
) => selectors.selectById(state, myAddress)

export const selectPostIdsByOwner = (state: RootState, id: AccountId) =>
  selectEntityOfPostIdsByOwner(state, { id })?.ownPostIds

type FetchOnePostIdsArgs = FetchOneArgs<Args>

export const fetchPostIdsOwnedByAccount = createAsyncThunk<
  MaybeEntity,
  FetchOnePostIdsArgs,
  ThunkApiConfig
>(
  'ownPostIds/fetchOne',
  async ({ api, id, spaceIds, reload }, { getState }): Promise<MaybeEntity> => {
    const myAddress = id as AccountId
    const knownPostIds = selectPostIdsByOwner(getState(), myAddress)
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
      ownPostIds: descSort(postIds),
    }
  },
)

const slice = createSlice({
  name: 'ownPostIds',
  initialState: adapter.getInitialState(),
  reducers: {
    // upsertOwnPostIds: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchPostIdsOwnedByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  },
})

export const {
  // upsertOwnPostIds,
} = slice.actions

export default slice.reducer
