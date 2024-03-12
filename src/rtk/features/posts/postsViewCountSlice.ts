import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getPostsViewCount } from 'src/components/utils/datahub/post-view'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleManyFetchWrapper } from 'src/rtk/app/wrappers'

export type PostViewCount = {
  postId: string
  viewsCount: number
}

const sliceName = 'postsViewCount'

const adapter = createEntityAdapter<PostViewCount>({
  selectId: data => data.postId,
})
const selectors = adapter.getSelectors<RootState>(state => state.postsViewCount)

export const selectPostViewCount = selectors.selectById

export const fetchPostsViewCount = createSimpleManyFetchWrapper<
  { postIds: string[] },
  PostViewCount
>({
  sliceName,
  fetchData: async function ({ postIds }) {
    return await getPostsViewCount(postIds)
  },
  getCachedData: (state, id) => selectPostViewCount(state, id),
  saveToCacheAction: data => slice.actions.setPostsViewCount(data),
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
    setPostsViewCount: adapter.upsertMany,
  },
})

export default slice.reducer
