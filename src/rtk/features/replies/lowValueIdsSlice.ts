import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getLowValueIds } from 'src/components/utils/datahub/posts'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type LowValueIds = {
  rootPostId: string
  lowValueIds: string[]
}

const sliceName = 'lowValueIds'

const adapter = createEntityAdapter<LowValueIds>({
  selectId: data => data.rootPostId,
})
const selectors = adapter.getSelectors<RootState>(state => state.lowValueIds)

export const selectLowValueIds = selectors.selectById

export const fetchLowValueIds = createSimpleFetchWrapper<{ rootPostId: string }, LowValueIds>({
  sliceName,
  fetchData: async function ({ rootPostId }) {
    return await getLowValueIds(rootPostId)
  },
  getCachedData: (state, { rootPostId }) => selectLowValueIds(state, rootPostId),
  saveToCacheAction: data => slice.actions.setIsPostLowValue(data),
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setIsPostLowValue: adapter.upsertOne,
  },
})

export default slice.reducer
