import {
  DataHubSubscriptionEventEnum,
  SocialCallDataArgs,
  socialCallName,
} from '@subsocial/data-hub-sdk'
import axios, { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import { gql as gqlRequest } from 'graphql-request'
import gql from 'graphql-tag'
import { CREATORS_CONSTANTS } from 'src/config/constants'
import { getStoreDispatcher } from 'src/rtk/app/store'
import {
  AddressLikeCount,
  fetchAddressLikeCounts,
} from 'src/rtk/features/activeStaking/addressLikeCountSlice'
import { CanPostSuperLiked } from 'src/rtk/features/activeStaking/canPostSuperLikedSlice'
import { PostRewards } from 'src/rtk/features/activeStaking/postRewardSlice'
import { PrevReward, PrevRewardStatus } from 'src/rtk/features/activeStaking/prevRewardSlice'
import { RewardHistory } from 'src/rtk/features/activeStaking/rewardHistorySlice'
import { fetchRewardReport, RewardReport } from 'src/rtk/features/activeStaking/rewardReportSlice'
import {
  invalidateSuperLikeCounts,
  SuperLikeCount,
} from 'src/rtk/features/activeStaking/superLikeCountsSlice'
import { SuperLikeMessage } from 'src/rtk/features/activeStaking/superLikeMessageSlice'
import {
  createSocialDataEventPayload,
  DatahubParams,
  datahubQueryRequest,
  datahubSubscription,
  getDayAndWeekTimestamp,
} from './utils'

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
    query: GET_SUPER_LIKE_COUNTS,
    variables: { postIds },
    fetchPolicy: 'network-only',
  })

  const resultMap = new Map<string, SuperLikeCount>()
  res.data.activeStakingSuperLikeCountsByPost.forEach(item =>
    resultMap.set(item.persistentPostId, {
      postId: item.persistentPostId,
      count: item.count,
    }),
  )

  return postIds.map(postId => resultMap.get(postId) ?? { postId, count: 0 })
}

const GET_POST_REWARDS = gql`
  query GetPostRewards($postIds: [String!]!) {
    activeStakingRewardsByPosts(args: { postPersistentIds: $postIds }) {
      persistentPostId
      rewardTotal
      draftRewardTotal
      rewardsBySource {
        fromDirectSuperLikes
        fromCommentSuperLikes
        fromShareSuperLikes
      }
      draftRewardsBySource {
        fromDirectSuperLikes
        fromCommentSuperLikes
        fromShareSuperLikes
      }
    }
  }
`
function parseToBigInt(value: string | undefined) {
  if (!value) return BigInt(0)
  return BigInt(value.split('.')[0])
}
export async function getPostRewards(postIds: string[]): Promise<PostRewards[]> {
  const res = await datahubQueryRequest<
    {
      activeStakingRewardsByPosts: {
        persistentPostId: string
        rewardTotal: string
        draftRewardTotal: string
        rewardsBySource?: {
          fromDirectSuperLikes: string
          fromCommentSuperLikes: string
          fromShareSuperLikes: string
        }
        draftRewardsBySource?: {
          fromDirectSuperLikes: string
          fromCommentSuperLikes: string
          fromShareSuperLikes: string
        }
      }[]
    },
    { postIds: string[] }
  >({
    query: GET_POST_REWARDS,
    variables: { postIds },
  })

  const resultMap = new Map<string, PostRewards>()
  res.data.activeStakingRewardsByPosts.forEach(item => {
    const { draftRewardsBySource, rewardsBySource, draftRewardTotal, rewardTotal } = item
    const total = parseToBigInt(rewardTotal) + parseToBigInt(draftRewardTotal)

    resultMap.set(item.persistentPostId, {
      postId: item.persistentPostId,
      reward: total.toString(),
      isNotZero: total > 0,
      rewardDetail: {
        finalizedReward: rewardTotal,
        draftReward: draftRewardTotal,
      },
      rewardsBySource: {
        fromCommentSuperLikes: (
          parseToBigInt(rewardsBySource?.fromCommentSuperLikes) +
          parseToBigInt(draftRewardsBySource?.fromCommentSuperLikes)
        ).toString(),
        fromDirectSuperLikes: (
          parseToBigInt(rewardsBySource?.fromDirectSuperLikes) +
          parseToBigInt(draftRewardsBySource?.fromDirectSuperLikes)
        ).toString(),
        fromShareSuperLikes: (
          parseToBigInt(rewardsBySource?.fromShareSuperLikes) +
          parseToBigInt(draftRewardsBySource?.fromShareSuperLikes)
        ).toString(),
      },
    })
  })

  return postIds.map(
    postId =>
      resultMap.get(postId) ?? {
        postId,
        reward: '0',
        draftReward: '0',
        isNotZero: false,
        rewardDetail: {
          finalizedReward: '0',
          draftReward: '0',
        },
        rewardsBySource: {
          fromCommentSuperLikes: '0',
          fromDirectSuperLikes: '0',
          fromShareSuperLikes: '0',
        },
      },
  )
}

const GET_ADDRESS_LIKE_COUNT_TO_POSTS = gql`
  query GetAddressLikeCountToPosts($address: String!, $postIds: [String!]!) {
    activeStakingSuperLikeCountsByStaker(args: { postPersistentIds: $postIds, address: $address }) {
      persistentPostId
      count
    }
  }
`
export async function getAddressLikeCountToPosts(
  address: string,
  postIds: string[],
): Promise<AddressLikeCount[]> {
  const res = await datahubQueryRequest<
    {
      activeStakingSuperLikeCountsByStaker: {
        persistentPostId: string
        count: number
      }[]
    },
    { postIds: string[]; address: string }
  >({
    query: GET_ADDRESS_LIKE_COUNT_TO_POSTS,
    variables: { postIds, address },
    fetchPolicy: 'network-only',
  })

  const resultMap = new Map<string, AddressLikeCount>()
  res.data.activeStakingSuperLikeCountsByStaker.forEach(item =>
    resultMap.set(item.persistentPostId, {
      address,
      postId: item.persistentPostId,
      count: item.count,
    }),
  )

  return postIds.map(postId => resultMap.get(postId) ?? { address, postId, count: 0 })
}

const GET_CAN_POSTS_SUPER_LIKED = gql`
  query GetCanPostsSuperLiked($postIds: [String!]!) {
    activeStakingCanDoSuperLikeByPost(args: { postPersistentIds: $postIds }) {
      persistentPostId
      validByCreationDate
      validByCreatorMinStake
      validByLowValue
    }
  }
`
export async function getCanPostsSuperLiked(postIds: string[]): Promise<CanPostSuperLiked[]> {
  const res = await datahubQueryRequest<
    {
      activeStakingCanDoSuperLikeByPost: {
        persistentPostId: string
        validByCreationDate: boolean
        validByCreatorMinStake: boolean
        validByLowValue: boolean
      }[]
    },
    { postIds: string[] }
  >({
    query: GET_CAN_POSTS_SUPER_LIKED,
    variables: { postIds },
  })

  const resultMap = new Map<string, CanPostSuperLiked>()
  res.data.activeStakingCanDoSuperLikeByPost.forEach(item =>
    resultMap.set(item.persistentPostId, {
      postId: item.persistentPostId,
      canPostSuperLiked: item.validByCreationDate && item.validByCreatorMinStake,
      validByCreationDate: item.validByCreationDate,
      validByCreatorMinStake: item.validByCreatorMinStake,
      validByLowValue: item.validByLowValue,
      isExist: true,
    }),
  )

  return postIds.map(
    postId =>
      resultMap.get(postId) ?? {
        postId,
        canPostSuperLiked: false,
        isExist: false,
        validByCreationDate: false,
        validByCreatorMinStake: false,
        validByLowValue: false,
      },
  )
}

const GET_REWARD_REPORT = gql`
  query GetRewardReport($address: String!, $day: Int!, $week: Int!) {
    activeStakingDailyStatsByStaker(args: { address: $address, dayTimestamp: $day }) {
      superLikesCount
      currentRewardAmount
    }
    activeStakingRewardsByWeek(args: { weeks: [$week], filter: { account: $address } }) {
      staker
      creator {
        total
        rewardsBySource {
          fromDirectSuperLikes
          fromCommentSuperLikes
          fromShareSuperLikes
        }
        posts {
          superLikesCount
        }
      }
    }
  }
`
export async function getRewardReport(address: string): Promise<RewardReport> {
  const res = await datahubQueryRequest<
    {
      activeStakingDailyStatsByStaker: {
        superLikesCount: number
        currentRewardAmount: string
      }
      activeStakingRewardsByWeek: {
        staker: string
        creator: {
          total: string
          rewardsBySource?: {
            fromDirectSuperLikes: string
            fromCommentSuperLikes: string
            fromShareSuperLikes: string
          }
          posts: {
            superLikesCount: number
          }[]
        }
      }[]
    },
    { address: string; day: number; week: number }
  >({
    query: GET_REWARD_REPORT,
    variables: { address, ...getDayAndWeekTimestamp() },
    fetchPolicy: 'network-only',
  })
  const weekReward = res.data.activeStakingRewardsByWeek?.[0]

  return {
    ...res.data.activeStakingDailyStatsByStaker,
    weeklyReward: weekReward?.staker ?? '0',
    creatorReward: weekReward?.creator.total ?? '0',
    creatorRewardBySource: weekReward?.creator.rewardsBySource ?? {
      fromDirectSuperLikes: '0',
      fromCommentSuperLikes: '0',
      fromShareSuperLikes: '0',
    },
    receivedLikes:
      weekReward?.creator.posts.reduce((acc, post) => acc + post.superLikesCount, 0) ?? 0,
    address,
  }
}

const GET_REWARD_HISTORY = gql`
  query GetRewardHistory($address: String!) {
    activeStakingRewardsByWeek(args: { filter: { account: $address } }) {
      staker
      week
      creator {
        total
      }
    }
  }
`
export async function getRewardHistory(address: string): Promise<RewardHistory> {
  const res = await datahubQueryRequest<
    {
      activeStakingRewardsByWeek: {
        staker: string
        week: number
        creator: {
          total: string
        }
      }[]
    },
    { address: string }
  >({
    query: GET_REWARD_HISTORY,
    variables: { address },
  })

  const rewards = res.data.activeStakingRewardsByWeek.map(({ staker, week, creator }) => {
    const startDate = dayjs
      .utc()
      .year(week / 100)
      .isoWeek(week % 100)
      .startOf('week')
    const endDate = startDate.add(1, 'week')

    return {
      reward: staker,
      week,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      creatorReward: creator.total,
    }
  })
  rewards.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  return {
    address,
    rewards,
  }
}

const GET_SUPER_LIKES_STATS = gql`
  query GetSuperLikesStats($from: String!, $to: String!) {
    activeStakingSuperLikeCountsByDate(args: { fromDate: $from, toDate: $to, total: true }) {
      byDate {
        count
        dayUnixTimestamp
      }
      total
    }
  }
`
export type SuperLikesStat = { total: number; data: { count: number; dayUnixTimestamp: number }[] }
export async function getSuperLikesStats(period: number): Promise<SuperLikesStat> {
  const { day: currentTimestamp } = getDayAndWeekTimestamp()
  const currentMinusPeriod = dayjs().subtract(period, 'day').toDate()
  const { day: startTimestamp } = getDayAndWeekTimestamp(currentMinusPeriod)
  const res = await datahubQueryRequest<
    {
      activeStakingSuperLikeCountsByDate: {
        byDate: {
          count: number
          dayUnixTimestamp: number
        }[]
        total: number
      }
    },
    { from: string; to: string }
  >({
    query: GET_SUPER_LIKES_STATS,
    variables: { from: startTimestamp.toString(), to: currentTimestamp.toString() },
  })

  return {
    data: res.data.activeStakingSuperLikeCountsByDate.byDate,
    total: res.data.activeStakingSuperLikeCountsByDate.total,
  }
}

const GET_USER_YESTERDAY_REWARD = gql`
  query GetUserYesterdayReward($address: String!, $timestamp: String!) {
    activeStakingAccountActivityMetricsForFixedPeriod(
      args: {
        address: $address
        period: DAY
        periodValue: $timestamp
        staker: { likedPosts: true, earnedByPeriod: true }
      }
    ) {
      staker {
        likedPosts
        earnedByPeriod
      }
    }
  }
`
const GET_USER_LAST_WEEK_REWARD = gql`
  query GetUserLastWeekReward($address: String!, $timestamp: String!) {
    activeStakingAccountActivityMetricsForFixedPeriod(
      args: {
        address: $address
        period: WEEK
        periodValue: $timestamp
        staker: { earnedByPeriod: true, likedPostsByDay: true, likedPosts: true }
      }
    ) {
      staker {
        earnedByPeriod
        likedPostsByDay {
          dayUnixTimestamp
          count
        }
      }
    }
  }
`
export async function getUserPrevReward({ address }: { address: string }): Promise<PrevReward> {
  const yesterday = dayjs.utc().subtract(1, 'day')
  const isLastWeek = yesterday.isoWeek() !== dayjs.utc().isoWeek()
  const { day, week } = getDayAndWeekTimestamp(yesterday.toDate())

  if (isLastWeek) {
    const res = await datahubQueryRequest<
      {
        activeStakingAccountActivityMetricsForFixedPeriod: {
          staker: {
            earnedByPeriod: string
            likedPostsByDay: {
              dayUnixTimestamp: string
              count: number
            }[]
          }
        }
      },
      { address: string; timestamp: string }
    >({
      query: GET_USER_LAST_WEEK_REWARD,
      variables: {
        address,
        timestamp: week.toString(),
      },
    })
    const data = res.data.activeStakingAccountActivityMetricsForFixedPeriod

    let rewardStatus: PrevRewardStatus = 'half'
    let has0Activity = true
    let hasFullActivity = true
    let totalLikes = 0
    data.staker.likedPostsByDay.forEach(({ count }) => {
      totalLikes += count
      if (count > 0) has0Activity = false
      if (count < CREATORS_CONSTANTS.SUPER_LIKES_FOR_MAX_REWARD) hasFullActivity = false
    })
    if (hasFullActivity && data.staker.likedPostsByDay.length >= 7) rewardStatus = 'full'
    else if (has0Activity) rewardStatus = 'none'

    return {
      address,
      period: 'WEEK',
      earned: data.staker.earnedByPeriod,
      likedPosts: totalLikes,
      rewardStatus,
    }
  } else {
    const res = await datahubQueryRequest<
      {
        activeStakingAccountActivityMetricsForFixedPeriod: {
          staker: {
            likedPosts: number
            earnedByPeriod: string
          }
        }
      },
      { address: string; timestamp: string }
    >({
      query: GET_USER_YESTERDAY_REWARD,
      variables: {
        address,
        timestamp: day.toString(),
      },
    })
    const data = res.data.activeStakingAccountActivityMetricsForFixedPeriod

    let rewardStatus: PrevRewardStatus = 'full'
    let missedReward: string | undefined
    if (data.staker.likedPosts === 0) rewardStatus = 'none'
    else if (data.staker.likedPosts < CREATORS_CONSTANTS.SUPER_LIKES_FOR_MAX_REWARD) {
      rewardStatus = 'half'
      const rewardPerLike = BigInt(data.staker.earnedByPeriod) / BigInt(data.staker.likedPosts)
      const missedLikes = CREATORS_CONSTANTS.SUPER_LIKES_FOR_MAX_REWARD - data.staker.likedPosts
      missedReward = (rewardPerLike * BigInt(missedLikes)).toString()
    }

    return {
      address,
      period: 'DAY',
      earned: data.staker.earnedByPeriod,
      likedPosts: data.staker.likedPosts,
      rewardStatus,
      missedReward,
    }
  }
}

export async function getSuperLikeMessage(): Promise<SuperLikeMessage> {
  const res = await axios.get<any, AxiosResponse<{ data?: { message?: string } }>>(
    '/api/datahub/super-likes',
  )
  return {
    message: res.data.data?.message ?? '',
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

// SUBSCRIPTION
const SUBSCRIBE_SUPER_LIKE = gqlRequest`
  subscription SubscribeSuperLike {
    activeStakingSuperLike {
      event
      entity {
        staker {
          id
        }
        post {
          persistentId
        }
      }
    }
  }
`

let isSubscribed = false
export function subscribeSuperLike(myAddress: string | undefined) {
  if (isSubscribed) return
  isSubscribed = true

  const client = datahubSubscription()
  let unsub = client.subscribe(
    {
      query: SUBSCRIBE_SUPER_LIKE,
    },
    {
      complete: () => undefined,
      next: async data => {
        const eventData = data.data?.activeStakingSuperLike
        if (!eventData) return

        await processSubscriptionEvent(eventData as any, myAddress)
      },
      error: () => {
        console.log('error subscription')
      },
    },
  )

  return () => {
    unsub()
    isSubscribed = false
  }
}

async function processSubscriptionEvent(
  eventData: {
    event: DataHubSubscriptionEventEnum
    entity: { staker: { id: string }; post: { persistentId: string } }
  },
  myAddress: string | undefined,
) {
  if (
    eventData.event !== DataHubSubscriptionEventEnum.ACTIVE_STAKING_SUPER_LIKE_CREATED &&
    eventData.event !== DataHubSubscriptionEventEnum.ACTIVE_STAKING_SUPER_LIKE_STATE_UPDATED
  )
    return

  const { post, staker } = eventData.entity
  const dispatch = getStoreDispatcher()
  if (!dispatch) throw new Error('Dispatcher not exist')

  dispatch(invalidateSuperLikeCounts({ postId: post.persistentId }))
  if (staker.id === myAddress) {
    dispatch(fetchRewardReport({ address: myAddress, reload: true }))
    dispatch(
      fetchAddressLikeCounts({
        address: myAddress,
        postIds: [post.persistentId],
        reload: true,
      }),
    )
  }
}
