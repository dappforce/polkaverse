import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { asAccountId } from '@subsocial/api'
import { FetchOneArgs, ThunkApiConfig, validateDataSource } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId, idToBn, SpaceId } from 'src/types'
import { fetchProfileSpaces } from '../profiles/profilesSlice'

type Entity = {
  /** `id` is an account address that have any role in this spaces. */
  id: SpaceId
  spaceEditors: AccountId[]
}

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

const selectors = adapter.getSelectors<RootState>(state => state.spaceEditors)

type Args = {
  id: SpaceId
}

export const selectEntityOfSpaceEditors: SelectOneFn<Args, MaybeEntity> = (
  state,
  { id: myAddress },
) => selectors.selectById(state, myAddress)

export const selectSpaceEditors = (state: RootState, id: AccountId) =>
  selectEntityOfSpaceEditors(state, { id })?.spaceEditors

type FetchOneAccountIdsArgs = FetchOneArgs<Args>

export const fetchSpaceEditors = createAsyncThunk<
  MaybeEntity,
  FetchOneAccountIdsArgs,
  ThunkApiConfig
>(
  'spaceEditors/fetchOne',
  async (
    { api, id, reload, dataSource: _dataSource },
    { getState, dispatch },
  ): Promise<MaybeEntity> => {
    const dataSource = validateDataSource(_dataSource)

    const spaceId = id as SpaceId
    const knownAccountIds = selectSpaceEditors(getState(), spaceId)
    const isKnownOwner = typeof knownAccountIds !== 'undefined'
    if (!reload && isKnownOwner) {
      // Nothing to load: space ids owned by this account are already loaded.
      return undefined
    }

    const editors: AccountId[] =
      (await api.blockchain.getAccountsWithAnyRoleInSpace(idToBn(spaceId))) || []
    const spaceEditors = editors.map(x => asAccountId(x)?.toString() || x)

    dispatch(fetchProfileSpaces({ ids: spaceEditors, api, dataSource }))

    return {
      id: spaceId,
      spaceEditors,
    }
  },
)

const slice = createSlice({
  name: 'spaceEditors',
  initialState: adapter.getInitialState(),
  reducers: {
    upsertSpaceEditorsBySpaceId: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchSpaceEditors.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  },
})

export const { upsertSpaceEditorsBySpaceId } = slice.actions

export default slice.reducer
