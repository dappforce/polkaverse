import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
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
    setOptimisticRewardReportChange: (
      state,
      { payload }: PayloadAction<{ address: string; superLikeCountChange: 1 | -1 }>,
    ) => {
      const { address, superLikeCountChange } = payload
      const rewardReport = state.entities[address]
      if (!rewardReport) return

      if (rewardReport.superLikesCount > 0) {
        const rewardPerLike =
          BigInt(rewardReport.weeklyReward) / BigInt(rewardReport.superLikesCount)
        rewardReport.currentRewardAmount = (
          BigInt(rewardReport.currentRewardAmount) + rewardPerLike
        ).toString()
        rewardReport.weeklyReward = (BigInt(rewardReport.weeklyReward) + rewardPerLike).toString()
      }
      rewardReport.superLikesCount += superLikeCountChange
    },
    setRewardReport: adapter.upsertOne,
  },
})

export const { setOptimisticRewardReportChange } = slice.actions

export default slice.reducer
