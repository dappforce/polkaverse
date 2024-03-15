import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getPostRewards } from 'src/components/utils/datahub/active-staking'
import config from 'src/config'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleManyFetchWrapper } from 'src/rtk/app/wrappers'

export type PostRewards = {
  postId: string
  reward: string
  rewardDetail: {
    finalizedReward: string
    draftReward: string
  }
  isNotZero: boolean
  rewardsBySource: {
    fromDirectSuperLikes: string
    fromCommentSuperLikes: string
    fromShareSuperLikes: string
  }
}

const sliceName = 'postRewards'

const adapter = createEntityAdapter<PostRewards>({
  selectId: data => data.postId,
})
const selectors = adapter.getSelectors<RootState>(state => state.postReward)

export const selectPostReward = selectors.selectById

export const fetchPostRewards = createSimpleManyFetchWrapper<{ postIds: string[] }, PostRewards>({
  sliceName,
  fetchData: async function ({ postIds }) {
    if (!config.enableDatahub) return []
    return await getPostRewards(postIds)
  },
  getCachedData: (state, id) => selectPostReward(state, id),
  saveToCacheAction: data => slice.actions.setPostRewards(data),
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
    setPostRewards: adapter.upsertMany,
  },
})

export default slice.reducer
