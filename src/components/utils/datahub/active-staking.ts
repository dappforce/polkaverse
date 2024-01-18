import {
  DataHubSubscriptionEventEnum,
  SocialCallDataArgs,
  socialCallName,
} from '@subsocial/data-hub-sdk'
import axios from 'axios'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import utc from 'dayjs/plugin/utc'
import { gql } from 'graphql-request'
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
import { TopUsers } from 'src/rtk/features/activeStaking/topUsersSlice'
import {
  createSocialDataEventPayload,
  DatahubParams,
  datahubQueryRequest,
  datahubSubscription,
} from './utils'

dayjs.extend(utc)
dayjs.extend(isoWeek)

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

  const resultMap = new Map<string, SuperLikeCount>()
  res.activeStakingSuperLikeCountsByPost.forEach(item =>
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
      amount
    }
  }
`
export async function getPostRewards(postIds: string[]): Promise<PostRewards[]> {
  const res = await datahubQueryRequest<
    {
      activeStakingRewardsByPosts: {
        persistentPostId: string
        amount: string
      }[]
    },
    { postIds: string[] }
  >({
    document: GET_POST_REWARDS,
    variables: { postIds },
  })

  const resultMap = new Map<string, PostRewards>()
  res.activeStakingRewardsByPosts.forEach(item =>
    resultMap.set(item.persistentPostId, {
      postId: item.persistentPostId,
      amount: item.amount,
      isNotZero: BigInt(item.amount) > 0,
    }),
  )

  return postIds.map(postId => resultMap.get(postId) ?? { postId, amount: '0', isNotZero: false })
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
    document: GET_ADDRESS_LIKE_COUNT_TO_POSTS,
    variables: { postIds, address },
  })

  const resultMap = new Map<string, AddressLikeCount>()
  res.activeStakingSuperLikeCountsByStaker.forEach(item =>
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
    document: GET_CAN_POSTS_SUPER_LIKED,
    variables: { postIds },
  })

  const resultMap = new Map<string, CanPostSuperLiked>()
  res.activeStakingCanDoSuperLikeByPost.forEach(item =>
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
function getDayAndWeekTimestamp(currentDate: Date = new Date()) {
  let date = dayjs.utc(currentDate)
  date = date.startOf('day')
  const week = date.get('year') * 100 + date.isoWeek()
  return { day: date.unix(), week }
}
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
    document: GET_REWARD_REPORT,
    variables: { address, ...getDayAndWeekTimestamp() },
  })
  const weekReward = res.activeStakingRewardsByWeek?.[0]

  return {
    ...res.activeStakingDailyStatsByStaker,
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
    document: GET_REWARD_HISTORY,
    variables: { address },
  })

  return {
    address,
    rewards: res.activeStakingRewardsByWeek.map(({ staker, week, creator }) => {
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
    }),
  }
}

const GET_TOP_USERS = gql`
  query GetTopUsers($from: String!) {
    activeStakingStakersRankedBySuperLikesForPeriod(args: { fromTime: $from }) {
      address
      count
    }
    activeStakingCreatorsRankedBySuperLikesForPeriod(args: { fromTime: $from }) {
      address
      count
    }
  }
`
export async function getTopUsers(): Promise<TopUsers> {
  const now = getDayAndWeekTimestamp().day
  const from = dayjs(now).subtract(1, 'week').valueOf().toString()
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
const SUBSCRIBE_SUPER_LIKE = gql`
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
