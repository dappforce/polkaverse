import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getModeratorData } from 'src/components/utils/datahub/moderation'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type Moderator = {
  address: string
  postIds: string[]
  appIds: string[]
  exist: boolean
  organizationId: string | undefined
}

const sliceName = 'moderator'

const adapter = createEntityAdapter<Moderator>({
  selectId: data => data.address,
})
const selectors = adapter.getSelectors<RootState>(state => state.moderators)

export const selectModerator = selectors.selectById

export const fetchModerator = createSimpleFetchWrapper<{ address: string }, Moderator>({
  fetchData: async function ({ address }) {
    return await getModeratorData({ address })
  },
  saveToCacheAction: data => slice.actions.setModerator(data),
  getCachedData: (state, { address }) => selectModerator(state, address),
  sliceName,
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setModerator: adapter.upsertOne,
  },
})

export default slice.reducer
