import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getUserStatistics } from 'src/components/utils/datahub/leaderboard'
import config from 'src/config'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type UserStatistics = {
  address: string
  staker: {
    likedCreators: number
    likedPosts: number
    earnedByPeriod: string
    earnedTotal: string
    rank: number | undefined
  }
  creator: {
    likesCountByPeriod: number
    stakersWhoLiked: number
    earnedByPeriod: string
    earnedTotal: string
    rank: number | undefined
  }
}

const sliceName = 'userStatistics'

const adapter = createEntityAdapter<UserStatistics>({
  selectId: data => data.address,
})
const selectors = adapter.getSelectors<RootState>(state => state.userStatistics)

export const selectUserStatistics = selectors.selectById

export const fetchUserStatistics = createSimpleFetchWrapper<{ address: string }, UserStatistics>({
  sliceName,
  fetchData: async function ({ address }) {
    if (!config.enableDatahub)
      return {
        address,
        creator: {
          likesCountByPeriod: 0,
          earnedByPeriod: '0',
          earnedTotal: '0',
          rank: 0,
          stakersWhoLiked: 0,
        },
        staker: { earnedByPeriod: '0', earnedTotal: '0', likedCreators: 0, likedPosts: 0, rank: 0 },
      }
    const res = await getUserStatistics({ address })
    return res
  },
  getCachedData: (state, { address }) => selectUserStatistics(state, address),
  saveToCacheAction: data => slice.actions.setUserStatistics(data),
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setUserStatistics: adapter.upsertOne,
  },
})

export default slice.reducer
