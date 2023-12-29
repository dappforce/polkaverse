import { SocialCallDataArgs, socialCallName } from '@subsocial/data-hub-sdk'
import axios from 'axios'
import { gql } from 'graphql-request'
import { RewardReport } from 'src/rtk/features/activeStaking/rewardReport'
import { SuperLikeCount } from 'src/rtk/features/activeStaking/superLikeCountsSlice'
import { createSocialDataEventPayload, DatahubParams, datahubQueryRequest } from './utils'

// QUERIES
const GET_SUPER_LIKE_COUNTS = gql`
  query GetSuperLikeCounts($postIds: [String!]!) {
    activeStakingSuperLikeCountsByPost(args: { postPersistentIds: $postIds }) {
      persistentPostId
      count
    }
  }
`
export async function getSuperLikeCounts(postIds: string[]): Promise<SuperLikeCount[]> {
  const res = await datahubQueryRequest<
    {
      activeStakingSuperLikeCountsByPost: {
        persistentPostId: string
        count: number
      }[]
    },
    { postIds: string[] }
  >({
    document: GET_SUPER_LIKE_COUNTS,
    variables: { postIds },
  })

  return res.activeStakingSuperLikeCountsByPost.map(item => ({
    postId: item.persistentPostId,
    count: item.count,
  }))
}

const GET_REWARD_REPORT = gql`
  query GetRewardReport($address: String!, $day: Int!, $week: Int!) {
    activeStakingDailyStatsByStaker(args: { address: $address, dayTimestamp: $day }) {
      superLikesCount
      currentRewardAmount
    }
    activeStakingRewardsByWeek(args: { week: $week, filter: { account: $address } }) {
      staker
    }
  }
`
function getWeekNumber() {
  const currentDate = new Date()
  const startDate = new Date(currentDate.getFullYear(), 0, 1)
  const days = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))

  const weekNumber = Math.ceil(days / 7)
  return weekNumber
}
function getDayAndWeekTimestamp(currentDate: Date = new Date()) {
  const week = currentDate.getFullYear() * 100 + getWeekNumber()
  currentDate.setHours(0, 0, 0, 0)
  return { day: Math.floor(currentDate.getTime() / 1000), week }
}
export async function getRewardReport(address: string): Promise<RewardReport> {
  const res = await datahubQueryRequest<
    {
      activeStakingDailyStatsByStaker: {
        superLikesCount: number
        currentRewardAmount: number
      }
      activeStakingRewardsByWeek: {
        staker: number
      }
    },
    { address: string; day: number; week: number }
  >({
    document: GET_REWARD_REPORT,
    variables: { address, ...getDayAndWeekTimestamp() },
  })

  return {
    ...res.activeStakingDailyStatsByStaker,
    weeklyReward: res.activeStakingRewardsByWeek.staker,
    address,
  }
}

// MUTATIONS
export async function createSuperLike(
  params: DatahubParams<SocialCallDataArgs<'synth_active_staking_create_super_like'>>,
) {
  const input = createSocialDataEventPayload(
    socialCallName.synth_active_staking_create_super_like,
    params,
  )

  const res = await axios.post('/api/datahub/super-likes', input)
  return res.data
}
