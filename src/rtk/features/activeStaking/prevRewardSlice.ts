import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getUserPrevReward } from 'src/components/utils/datahub/active-staking'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type PrevRewardStatus = 'full' | 'half' | 'none'
export type PrevReward = {
  address: string
  period: 'WEEK' | 'DAY'
  likedPosts: number
  earned: {
    staker: string
    creator: string
  }
  rewardStatus: PrevRewardStatus
  missedReward?: string
}

const sliceName = 'rewardHistory'

const adapter = createEntityAdapter<PrevReward>({
  selectId: data => data.address,
})
const selectors = adapter.getSelectors<RootState>(state => state.prevReward)

export const selectUserPrevReward = selectors.selectById

export const fetchPrevReward = createSimpleFetchWrapper<{ address: string }, PrevReward>({
  fetchData: async function ({ address }) {
    return await getUserPrevReward({ address })
  },
  saveToCacheAction: data => slice.actions.setPrevReward(data),
  getCachedData: (state, { address }) => selectUserPrevReward(state, address),
  sliceName,
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setPrevReward: adapter.upsertOne,
  },
})

export default slice.reducer
