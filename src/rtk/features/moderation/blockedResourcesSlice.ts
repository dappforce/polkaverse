import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getBlockedResourcesInApp, ResourceTypes } from 'src/components/utils/datahub/moderation'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type BlockedResources = { resources: Record<ResourceTypes, string[]>; id: string }

const sliceName = 'blockedResources'

const adapter = createEntityAdapter<BlockedResources>({
  selectId: data => data.id,
})
const selectors = adapter.getSelectors<RootState>(state => state.blockedResources)

export const selectBlockedResources = selectors.selectById

export const fetchBlockedResources = createSimpleFetchWrapper<{ appId: string }, BlockedResources>({
  fetchData: async function ({ appId }) {
    return await getBlockedResourcesInApp(appId)
  },
  saveToCacheAction: data => slice.actions.setBlockedResources(data),
  getCachedData: (state, { appId }) => selectBlockedResources(state, appId),
  sliceName,
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setBlockedResources: adapter.upsertOne,
  },
})

export default slice.reducer
