import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import config from 'src/config'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, SpaceId } from 'src/types'
import { findSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { fetchPostIdsOwnedByAccount } from '../posts/ownPostIdsSlice'

type Entity = {
  /** `id` is an account address that owns spaces. */
  id: AccountId
  ownSpaceIds: SpaceId[]
}

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

const selectors = adapter.getSelectors<RootState>(state => state.ownSpaceIds)

type Args = {}

export const selectEntityOfSpaceIdsByOwner: SelectOneFn<Args, MaybeEntity> = (
  state,
  { id: myAddress },
) => selectors.selectById(state, myAddress)

export const selectSpaceIdsByOwner = (state: RootState, id: AccountId) =>
  selectEntityOfSpaceIdsByOwner(state, { id })?.ownSpaceIds

type FetchOneSpaceIdsArgs = FetchOneArgs<Args>

export const fetchSpaceIdsOwnedByAccount = createAsyncThunk<
  MaybeEntity,
  FetchOneSpaceIdsArgs,
  ThunkApiConfig
>('ownSpaceIds/fetchOne', async (args, { getState, dispatch }): Promise<MaybeEntity> => {
  const { api, id, reload } = args

  const myAddress = id as AccountId
  const knownSpaceIds = selectSpaceIdsByOwner(getState(), myAddress)
  const isKnownOwner = typeof knownSpaceIds !== 'undefined'
  if (!reload && isKnownOwner) {
    // Nothing to load: space ids owned by this account are already loaded.
    return undefined
  }

  const allSpaceIds = await api.blockchain.spaceIdsByOwner(myAddress)

  const { sudoOne } = config
  const spaceIds = sudoOne
    ? findSpaceIdsThatCanSuggestIfSudo(sudoOne, myAddress, allSpaceIds)
    : allSpaceIds

  await dispatch(fetchPostIdsOwnedByAccount({ ...args, spaceIds }))

  return {
    id: myAddress,
    ownSpaceIds: spaceIds.map(x => x.toString()),
  }
})

const slice = createSlice({
  name: 'ownSpaceIds',
  initialState: adapter.getInitialState(),
  reducers: {
    // upsertOwnSpaceIds: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchSpaceIdsOwnedByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  },
})

export const {
  // upsertOwnSpaceIds,
} = slice.actions

export default slice.reducer
