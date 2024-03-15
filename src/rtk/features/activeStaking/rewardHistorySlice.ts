import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getRewardHistory } from 'src/components/utils/datahub/active-staking'
import config from 'src/config'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type RewardHistory = {
  address: string
  rewards: {
    week: number
    startDate: string
    endDate: string
    reward: string
    creatorReward: string
  }[]
}

const sliceName = 'rewardHistory'

const adapter = createEntityAdapter<RewardHistory>({
  selectId: data => data.address,
})
const selectors = adapter.getSelectors<RootState>(state => state.rewardHistory)

export const selectUserRewardHistory = selectors.selectById

export const fetchRewardHistory = createSimpleFetchWrapper<{ address: string }, RewardHistory>({
  fetchData: async function ({ address }) {
    if (!config.enableDatahub) return { address, rewards: [] }
    return await getRewardHistory(address)
  },
  saveToCacheAction: data => slice.actions.setRewardHistory(data),
  getCachedData: (state, { address }) => selectUserRewardHistory(state, address),
  sliceName,
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setRewardHistory: adapter.upsertOne,
  },
})

export default slice.reducer
