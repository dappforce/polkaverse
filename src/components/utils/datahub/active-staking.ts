import {
  DataHubSubscriptionEventEnum,
  SocialCallDataArgs,
  socialCallName,
} from '@subsocial/data-hub-sdk'
import axios from 'axios'
import dayjs from 'dayjs'
import { gql as gqlRequest } from 'graphql-request'
import gql from 'graphql-tag'
import { getStoreDispatcher } from 'src/rtk/app/store'
import {
  AddressLikeCount,
  fetchAddressLikeCounts,
} from 'src/rtk/features/activeStaking/addressLikeCountSlice'
import { CanPostSuperLiked } from 'src/rtk/features/activeStaking/canPostSuperLikedSlice'
import { PostRewards } from 'src/rtk/features/activeStaking/postRewardSlice'
import { RewardHistory } from 'src/rtk/features/activeStaking/rewardHistorySlice'
import { fetchRewardReport, RewardReport } from 'src/rtk/features/activeStaking/rewardReportSlice'
import {
  fetchSuperLikeCounts,
  SuperLikeCount,
} from 'src/rtk/features/activeStaking/superLikeCountsSlice'
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
      reward
      draftReward
    }
  }
`
export async function getPostRewards(postIds: string[]): Promise<PostRewards[]> {
  const res = await datahubQueryRequest<
    {
      activeStakingRewardsByPosts: {
        persistentPostId: string
        reward: string
        draftReward: string
      }[]
    },
    { postIds: string[] }
  >({
    query: GET_POST_REWARDS,
    variables: { postIds },
  })

  const resultMap = new Map<string, PostRewards>()
  res.data.activeStakingRewardsByPosts.forEach(item => {
    resultMap.set(item.persistentPostId, {
      postId: item.persistentPostId,
      reward: item.reward,
      draftReward: item.draftReward,
      isNotZero: BigInt(item.reward) > 0 || BigInt(item.draftReward) > 0,
    })
  })

  return postIds.map(
    postId => resultMap.get(postId) ?? { postId, reward: '0', draftReward: '0', isNotZero: false },
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
      possible
    }
  }
`
export async function getCanPostsSuperLiked(postIds: string[]): Promise<CanPostSuperLiked[]> {
  const res = await datahubQueryRequest<
    {
      activeStakingCanDoSuperLikeByPost: {
        persistentPostId: string
        possible: boolean
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
      canPostSuperLiked: item.possible,
      isExist: true,
    }),
  )

  return postIds.map(
    postId => resultMap.get(postId) ?? { postId, canPostSuperLiked: false, isExist: false },
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
  })
  const weekReward = res.data.activeStakingRewardsByWeek?.[0]

  return {
    ...res.data.activeStakingDailyStatsByStaker,
    weeklyReward: weekReward?.staker ?? '0',
    creatorReward: weekReward?.creator.total ?? '0',
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

  dispatch(fetchSuperLikeCounts({ postIds: [post.persistentId], reload: true }))
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
