import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getRewardReport } from 'src/components/utils/datahub/super-likes'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type RewardReport = {
  superLikesCount: number
  currentRewardAmount: string
  weeklyReward: string
  address: string
}

const sliceName = 'rewardReport'

const adapter = createEntityAdapter<RewardReport>({
  selectId: data => data.address,
})
const selectors = adapter.getSelectors<RootState>(state => state.rewardReport)

export const selectUserRewardReport = selectors.selectById

export const fetchRewardReport = createSimpleFetchWrapper<{ address: string }, RewardReport>({
  fetchData: async function ({ address }) {
    return await getRewardReport(address)
  },
  saveToCacheAction: data => slice.actions.setRewardReport(data),
  getCachedData: (state, { address }) => selectUserRewardReport(state, address),
  sliceName,
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setRewardReport: adapter.upsertOne,
  },
})

export default slice.reducer
