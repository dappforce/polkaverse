import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, SpaceId } from 'src/types'

type Entity = {
  /** `id` is an account address that have any role in this spaces. */
  id: AccountId
  spaceIdsWithRolesByAccount: SpaceId[]
}

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

const selectors = adapter.getSelectors<RootState>(state => state.spaceIdsWithRolesByAccount)

type Args = {}

export const selectEntityOfSpaceIdsWithRolesByAccount: SelectOneFn<Args, MaybeEntity> = (
  state,
  { id: myAddress },
) => selectors.selectById(state, myAddress)

export const selectSpaceIdsWithRolesByAccount = (state: RootState, id: AccountId) =>
  selectEntityOfSpaceIdsWithRolesByAccount(state, { id })?.spaceIdsWithRolesByAccount

type FetchOneSpaceIdsArgs = FetchOneArgs<Args>

export const fetchSpaceIdsWithRolesByAccount = createAsyncThunk<
  MaybeEntity,
  FetchOneSpaceIdsArgs,
  ThunkApiConfig
>(
  'spaceIdsWithRolesByAccount/fetchOne',
  async ({ api, id, reload }, { getState }): Promise<MaybeEntity> => {
    const myAddress = id as AccountId
    const knownSpaceIds = selectSpaceIdsWithRolesByAccount(getState(), myAddress)
    const isKnownOwner = typeof knownSpaceIds !== 'undefined'
    if (!reload && isKnownOwner) {
      // Nothing to load: space ids owned by this account are already loaded.
      return undefined
    }

    const spaceIds: SpaceId[] =
      (await api.blockchain.getSpaceIdsWithRolesByAccount(myAddress)) || []

    return {
      id: myAddress,
      spaceIdsWithRolesByAccount: spaceIds,
    }
  },
)

const slice = createSlice({
  name: 'spaceIdsWithRolesByAccount',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertSpaceIdsWithRolesByAccount: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchSpaceIdsWithRolesByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  },
})

export const { upsertSpaceIdsWithRolesByAccount } = slice.actions

export default slice.reducer
