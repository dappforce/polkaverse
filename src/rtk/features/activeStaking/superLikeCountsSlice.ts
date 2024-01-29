import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getSuperLikeCounts } from 'src/components/utils/datahub/active-staking'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleManyFetchWrapper } from 'src/rtk/app/wrappers'

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

export const fetchSuperLikeCounts = createSimpleManyFetchWrapper<
  { postIds: string[] },
  SuperLikeCount
>({
  sliceName,
  fetchData: async function ({ postIds }) {
    return await getSuperLikeCounts(postIds)
  },
  getCachedData: (state, id) => selectPostSuperLikeCount(state, id),
  saveToCacheAction: data => slice.actions.setSuperLikeCounts(data),
  shouldFetchCondition: ({ postIds }) => postIds?.length !== 0,
  filterNewArgs: ({ postIds }, isNewId) => {
    const newPostIds = postIds?.filter(postId => isNewId(postId))
    return { postIds: newPostIds }
  },
})

export const invalidateSuperLikeCounts = createAsyncThunk<void, { postId: string }, ThunkApiConfig>(
  `${sliceName}/invalidate`,
  async ({ postId }, { getState, dispatch }) => {
    const state = selectPostSuperLikeCount(getState(), postId)
    if (!state) return

    await dispatch(fetchSuperLikeCounts({ postIds: [postId], reload: true }))
  },
)

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
