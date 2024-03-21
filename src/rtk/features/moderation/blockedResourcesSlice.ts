import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  getBlockedResourcesInApp,
  getBlockedResourceType,
  ResourceTypes,
} from 'src/components/utils/datahub/moderation'
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
    if (!appId) return { id: '', resources: { address: [], cid: [], postId: [] } }
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
    updateBlockedResources: (
      state,
      action: PayloadAction<{ id: string; type: 'remove' | 'add'; idToProcess: string }>,
    ) => {
      const resourceType = getBlockedResourceType(action.payload.idToProcess)
      const existing = state.entities[action.payload.id]
      if (existing && resourceType) {
        if (action.payload.type === 'add') {
          existing.resources[resourceType].push(action.payload.idToProcess)
        } else {
          existing.resources[resourceType] = existing.resources[resourceType].filter(
            id => id !== action.payload.idToProcess,
          )
        }
      }
    },
  },
})
export const { updateBlockedResources } = slice.actions

export default slice.reducer
