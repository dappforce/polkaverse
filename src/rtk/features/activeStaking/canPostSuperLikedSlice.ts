import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getCanPostsSuperLiked } from 'src/components/utils/datahub/active-staking'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleManyFetchWrapper } from 'src/rtk/app/wrappers'

export type CanPostSuperLiked = {
  postId: string
  canPostSuperLiked: boolean
  isExist?: boolean
}

const sliceName = 'canPostSuperLiked'

const adapter = createEntityAdapter<CanPostSuperLiked>({
  selectId: data => data.postId,
})
const selectors = adapter.getSelectors<RootState>(state => state.canPostSuperLiked)

export const selectCanPostSuperLiked = selectors.selectById
export const selectAllCanPostSuperLiked = selectors.selectEntities

export const fetchCanPostsSuperLiked = createSimpleManyFetchWrapper<
  { postIds: string[] },
  CanPostSuperLiked
>({
  sliceName,
  fetchData: async function ({ postIds }) {
    return await getCanPostsSuperLiked(postIds)
  },
  getCachedData: (state, id) => selectCanPostSuperLiked(state, id),
  saveToCacheAction: data => slice.actions.setCanPostsSuperLiked(data),
  shouldFetchCondition: ({ postIds }) => postIds?.length !== 0,
  filterNewArgs: ({ postIds }, isNewId) => {
    const newPostIds = postIds?.filter(postId => isNewId(postId))
    return { postIds: newPostIds }
  },
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setCanPostsSuperLiked: adapter.upsertMany,
  },
})

export default slice.reducer
