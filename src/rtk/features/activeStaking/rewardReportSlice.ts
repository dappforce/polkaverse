import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getRewardReport } from 'src/components/utils/datahub/active-staking'
import { CREATORS_CONSTANTS } from 'src/config/constants'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type RewardReport = {
  superLikesCount: number
  currentRewardAmount: string
  weeklyReward: string

  creatorReward: string
  receivedLikes: number

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

      const newSuperLike = rewardReport.superLikesCount + superLikeCountChange
      if (rewardReport.superLikesCount > 0) {
        const rewardMultiplier = BigInt(
          Math.min(newSuperLike, CREATORS_CONSTANTS.SUPER_LIKES_FOR_MAX_REWARD),
        )
        const oldSuperLikeMultiplier = BigInt(
          Math.min(rewardReport.superLikesCount, CREATORS_CONSTANTS.SUPER_LIKES_FOR_MAX_REWARD),
        )

        const rewardPerLike = BigInt(rewardReport.currentRewardAmount) / oldSuperLikeMultiplier
        const weeklyWithoutCurrentReward =
          BigInt(rewardReport.weeklyReward) - BigInt(rewardReport.currentRewardAmount)

        rewardReport.currentRewardAmount = (rewardMultiplier * rewardPerLike).toString()
        rewardReport.weeklyReward = (
          weeklyWithoutCurrentReward + BigInt(rewardReport.currentRewardAmount)
        ).toString()
      }
      rewardReport.superLikesCount = newSuperLike
    },
    setRewardReport: (state, action: PayloadAction<RewardReport>) => {
      const { address, superLikesCount, currentRewardAmount, weeklyReward } = action.payload
      const rewardReport = state.entities[address]
      if (!rewardReport || rewardReport.superLikesCount < superLikesCount) {
        adapter.upsertOne(state, action.payload)
        return
      }

      const rewardMultiplier = BigInt(
        Math.min(superLikesCount, CREATORS_CONSTANTS.SUPER_LIKES_FOR_MAX_REWARD),
      )
      const rewardPerLike = BigInt(currentRewardAmount) / rewardMultiplier
      const weeklyWithoutCurrentReward = BigInt(weeklyReward) - BigInt(currentRewardAmount)

      rewardReport.currentRewardAmount = (
        rewardPerLike *
        BigInt(
          Math.min(rewardReport.superLikesCount, CREATORS_CONSTANTS.SUPER_LIKES_FOR_MAX_REWARD),
        )
      ).toString()
      rewardReport.weeklyReward = (
        weeklyWithoutCurrentReward + BigInt(rewardReport.currentRewardAmount)
      ).toString()
    },
  },
})

export const { setOptimisticRewardReportChange } = slice.actions

export default slice.reducer
