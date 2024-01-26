import gql from 'graphql-tag'
import { GeneralStatistics } from 'src/rtk/features/leaderboard/generalStatisticsSlice'
import { LeaderboardData } from 'src/rtk/features/leaderboard/leaderboardSlice'
import { TopUsers } from 'src/rtk/features/leaderboard/topUsersSlice'
import { UserStatistics } from 'src/rtk/features/leaderboard/userStatisticsSlice'
import { datahubQueryRequest, getDayAndWeekTimestamp } from './utils'

const GET_TOP_USERS = gql`
  query GetTopUsers($from: String!) {
    staker: activeStakingAddressesRankedByRewardsForPeriod(
      args: {
        filter: { period: WEEK, role: STAKER, timestamp: $from }
        limit: 9
        offset: 0
        order: DESC
      }
    ) {
      data {
        address
        reward
      }
    }
    creator: activeStakingAddressesRankedByRewardsForPeriod(
      args: {
        filter: { period: WEEK, role: CREATOR, timestamp: $from }
        limit: 9
        offset: 0
        order: DESC
      }
    ) {
      data {
        address
        reward
      }
    }
  }
`
export async function getTopUsers(): Promise<TopUsers> {
  const { week } = getDayAndWeekTimestamp()
  const res = await datahubQueryRequest<
    {
      staker: {
        data: {
          address: string
          reward: string
        }[]
      }
      creator: {
        data: {
          address: string
          reward: string
        }[]
      }
    },
    { from: string }
  >({
    document: GET_TOP_USERS,
    variables: { from: week.toString() },
  })

  return {
    creators: res.creator.data.map(({ address, reward }) => ({
      address,
      reward,
    })),
    stakers: res.staker.data.map(({ address, reward }) => ({
      address,
      reward,
    })),
  }
}

const GET_USER_STATS = gql`
  query GetUserStats($address: String!, $timestamp: String!) {
    staker: activeStakingAddressRankByRewardsForPeriod(
      args: { address: $address, period: WEEK, role: STAKER, timestamp: $timestamp }
    ) {
      rankIndex
    }
    creator: activeStakingAddressRankByRewardsForPeriod(
      args: { address: $address, period: WEEK, role: CREATOR, timestamp: $timestamp }
    ) {
      rankIndex
    }
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
      staker: {
        reward: string
        rankIndex: number
      }
      creator: {
        reward: string
        rankIndex: number
      }
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
    { address: string; timestamp: string }
  >({
    document: GET_USER_STATS,
    variables: { address, timestamp: getDayAndWeekTimestamp().week.toString() },
  })

  return {
    address,
    creator: {
      ...res.activeStakingAccountActivityMetricsForFixedPeriod.creator,
      rank: res.creator.rankIndex,
    },
    staker: {
      ...res.activeStakingAccountActivityMetricsForFixedPeriod.staker,
      rank: res.staker.rankIndex,
    },
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

const GET_LEADERBOARD = gql`
  query GetLeaderboardTableData(
    $role: ActiveStakingAccountRole!
    $timestamp: String!
    $limit: Int!
    $offset: Int!
  ) {
    activeStakingAddressesRankedByRewardsForPeriod(
      args: {
        filter: { period: WEEK, role: $role, timestamp: $timestamp }
        limit: $limit
        offset: $offset
        order: DESC
      }
    ) {
      data {
        address
        reward
        rank
      }
      total
      limit
    }
  }
`
export const LEADERBOARD_PAGE_LIMIT = 15
export type LeaderboardRole = 'staker' | 'creator'
export async function getLeaderboardData({
  page,
  role,
}: {
  role: LeaderboardRole
  page: number
}): Promise<LeaderboardData> {
  const { week } = getDayAndWeekTimestamp()
  const offset = Math.max(page - 1, 0) * LEADERBOARD_PAGE_LIMIT
  const res = await datahubQueryRequest<
    {
      activeStakingAddressesRankedByRewardsForPeriod: {
        data: {
          address: string
          reward: string
          rank: number
        }[]
        total: number
        limit: number
      }
    },
    { role: string; timestamp: string; limit: number; offset: number }
  >({
    document: GET_LEADERBOARD,
    variables: {
      role: role === 'creator' ? 'CREATOR' : 'STAKER',
      timestamp: week.toString(),
      limit: LEADERBOARD_PAGE_LIMIT,
      offset,
    },
  })

  const data = res.activeStakingAddressesRankedByRewardsForPeriod
  return {
    data: data.data,
    hasMore: data.total > data.limit + offset,
    total: data.total,
    page,
    role,
  }
}
