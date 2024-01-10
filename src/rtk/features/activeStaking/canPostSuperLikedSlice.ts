import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getCanPostsSuperLiked } from 'src/components/utils/datahub/super-likes'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type CanPostSuperLiked = {
  postId: string
  canPostSuperLiked: boolean
}

const sliceName = 'canPostSuperLiked'

const adapter = createEntityAdapter<CanPostSuperLiked>({
  selectId: data => data.postId,
})
const selectors = adapter.getSelectors<RootState>(state => state.canPostSuperLiked)

export const selectCanPostSuperLiked = selectors.selectById
export const selectAllCanPostSuperLiked = selectors.selectEntities

export const fetchCanPostsSuperLiked = createSimpleFetchWrapper<
  { postIds: string[] },
  CanPostSuperLiked[]
>({
  fetchData: async function ({ postIds }) {
    return await getCanPostsSuperLiked(postIds)
  },
  saveToCacheAction: data => slice.actions.setCanPostsSuperLiked(data),
  getCachedData: (state, { postIds }) => {
    const entities = selectAllCanPostSuperLiked(state)
    let isEveryDataCached = true

    const queriedEntities: CanPostSuperLiked[] = []
    for (let i = 0; i < postIds.length; i++) {
      const postId = postIds[i]
      if (!entities[postId]) {
        isEveryDataCached = false
        break
      } else {
        queriedEntities.push(entities[postId]!)
      }
    }

    if (isEveryDataCached) {
      return queriedEntities
    }
    return undefined
  },
  sliceName,
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setCanPostsSuperLiked: adapter.upsertMany,
  },
})

export default slice.reducer
