import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getSuperLikeCounts } from 'src/components/utils/datahub/super-likes'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type SuperLikeCount = {
  postId: string
  count: number
}

const sliceName = 'superLikesCounts'

const adapter = createEntityAdapter<SuperLikeCount>({
  selectId: data => data.postId,
})
const selectors = adapter.getSelectors<RootState>(state => state.superLikeCounts)

export const selectPostSuperLikeCount = selectors.selectById
export const selectPostSuperLikeCounts = selectors.selectEntities

export const fetchSuperLikeCounts = createSimpleFetchWrapper<
  { postIds: string[] },
  SuperLikeCount[]
>({
  fetchData: async function ({ postIds }) {
    return await getSuperLikeCounts(postIds)
  },
  saveToCacheAction: data => slice.actions.setSuperLikeCounts(data),
  getCachedData: (state, { postIds }) => {
    const entities = selectPostSuperLikeCounts(state)
    let isEveryDataCached = true

    const postEntities: SuperLikeCount[] = []
    for (let i = 0; i < postIds.length; i++) {
      const postId = postIds[i]
      if (!entities[postId]) {
        isEveryDataCached = false
        break
      } else {
        postEntities.push(entities[postId]!)
      }
    }

    if (isEveryDataCached) {
      return postEntities
    }
    return undefined
  },
  sliceName,
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setSuperLikeCount: adapter.upsertOne,
    setSuperLikeCounts: adapter.upsertMany,
  },
})

export const { setSuperLikeCount } = slice.actions

export default slice.reducer
