import dayjs from 'dayjs'
import gql from 'graphql-tag'
import { GeneralStatistics } from 'src/rtk/features/leaderboard/generalStatisticsSlice'
import { TopUsers } from 'src/rtk/features/leaderboard/topUsersSlice'
import { UserStatistics } from 'src/rtk/features/leaderboard/userStatisticsSlice'
import { datahubQueryRequest } from './utils'

const GET_TOP_USERS = gql`
  query GetTopUsers($from: String!) {
    activeStakingStakersRankedBySuperLikesForPeriod(args: { fromTime: $from, limit: 3 }) {
      address
      count
    }
    activeStakingCreatorsRankedBySuperLikesForPeriod(args: { fromTime: $from, limit: 3 }) {
      address
      count
    }
  }
`
export async function getTopUsers(): Promise<TopUsers> {
  const now = dayjs()
  const from = now.subtract(1, 'day').valueOf().toString()
  const res = await datahubQueryRequest<
    {
      activeStakingStakersRankedBySuperLikesForPeriod: {
        address: string
        count: number
      }[]
      activeStakingCreatorsRankedBySuperLikesForPeriod: {
        address: string
        count: number
      }[]
    },
    { from: string }
  >({
    document: GET_TOP_USERS,
    variables: { from },
  })

  return {
    creators: res.activeStakingCreatorsRankedBySuperLikesForPeriod.map(({ address, count }) => ({
      address,
      superLikesCount: count,
    })),
    stakers: res.activeStakingStakersRankedBySuperLikesForPeriod.map(({ address, count }) => ({
      address,
      superLikesCount: count,
    })),
  }
}

const GET_USER_STATS = gql`
  query GetUserStats($address: String!) {
    activeStakingAccountActivityMetricsForFixedPeriod(
      args: {
        address: $address
        period: WEEK
        staker: { likedPosts: true, likedCreators: true, earnedByPeriod: true, earnedTotal: true }
        creator: {
          likesCountByPeriod: true
          stakersWhoLiked: true
          earnedByPeriod: true
          earnedTotal: true
        }
      }
    ) {
      staker {
        likedCreators
        likedPosts
        earnedByPeriod
        earnedTotal
      }
      creator {
        likesCountByPeriod
        stakersWhoLiked
        earnedByPeriod
        earnedTotal
      }
    }
  }
`
export async function getUserStatistics({ address }: { address: string }): Promise<UserStatistics> {
  const res = await datahubQueryRequest<
    {
      activeStakingAccountActivityMetricsForFixedPeriod: {
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
    },
    { address: string }
  >({
    document: GET_USER_STATS,
    variables: { address },
  })

  return {
    address,
    ...res.activeStakingAccountActivityMetricsForFixedPeriod,
  }
}

const GET_GENERAL_STATS = gql`
  query GetGeneralStats {
    activeStakingTotalActivityMetricsForFixedPeriod(
      args: {
        period: WEEK
        likedPostsCount: true
        likedCreatorsCount: true
        stakersEarnedTotal: true
        creatorEarnedTotal: true
      }
    ) {
      likedPostsCount
      likedCreatorsCount
      stakersEarnedTotal
      creatorEarnedTotal
    }
  }
`
export async function getGeneralStatistics(): Promise<GeneralStatistics> {
  const res = await datahubQueryRequest<
    {
      activeStakingTotalActivityMetricsForFixedPeriod: {
        likedPostsCount: number
        likedCreatorsCount: number
        stakersEarnedTotal: string
        creatorEarnedTotal: string
      }
    },
    {}
  >({
    document: GET_GENERAL_STATS,
    variables: {},
  })

  const data = res.activeStakingTotalActivityMetricsForFixedPeriod
  return {
    creatorsEarnedTotal: data.creatorEarnedTotal,
    creatorsLiked: data.likedCreatorsCount,
    postsLiked: data.likedPostsCount,
    stakersEarnedTotal: data.stakersEarnedTotal,
  }
}
