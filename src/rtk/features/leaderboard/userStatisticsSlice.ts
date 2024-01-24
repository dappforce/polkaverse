import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getUserStatistics } from 'src/components/utils/datahub/leaderboard'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type UserStatistics = {
  address: string
  staker: {
    likedCreators: number
    likedPosts: number
    earnedByPeriod: string
    earnedTotal: string
  }
  creator: {
    likesCountByPeriod: number
    stakersWhoLiked: number
    earnedByPeriod: string
    earnedTotal: string
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
