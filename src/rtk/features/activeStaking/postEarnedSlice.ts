import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getPostEarned } from 'src/components/utils/datahub/super-likes'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleManyFetchWrapper } from 'src/rtk/app/wrappers'

export type PostEarned = {
  postId: string
  earned: string
  hasEarned: boolean
}

const sliceName = 'postEarned'

const adapter = createEntityAdapter<PostEarned>({
  selectId: data => data.postId,
})
const selectors = adapter.getSelectors<RootState>(state => state.postEarned)

export const selectPostEarned = selectors.selectById

export const fetchPostEarned = createSimpleManyFetchWrapper<{ postIds: string[] }, PostEarned>({
  sliceName,
  fetchData: async function ({ postIds }) {
    return await getPostEarned(postIds)
  },
  getCachedData: (state, id) => selectPostEarned(state, id),
  saveToCacheAction: data => slice.actions.setPostEarned(data),
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
    setPostEarned: adapter.upsertMany,
  },
})

export default slice.reducer
