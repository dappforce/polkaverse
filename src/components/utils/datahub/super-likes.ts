import {
  DataHubSubscriptionEventEnum,
  SocialCallDataArgs,
  socialCallName,
} from '@subsocial/data-hub-sdk'
import axios from 'axios'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { gql } from 'graphql-request'
import { getStoreDispatcher } from 'src/rtk/app/store'
import { fetchRewardReport, RewardReport } from 'src/rtk/features/activeStaking/rewardReport'
import {
  fetchSuperLikeCounts,
  SuperLikeCount,
} from 'src/rtk/features/activeStaking/superLikeCountsSlice'
import {
  createSocialDataEventPayload,
  DatahubParams,
  datahubQueryRequest,
  datahubSubscription,
} from './utils'

dayjs.extend(utc)
dayjs.extend(weekOfYear)

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

function getDayAndWeekTimestamp(currentDate: Date = new Date()) {
  let date = dayjs.utc(currentDate)
  date = date.startOf('day')
  const week = date.get('year') * 100 + date.week()
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
  console.log('sub')
  let unsub = client.subscribe(
    {
      query: SUBSCRIBE_SUPER_LIKE,
    },
    {
      complete: () => undefined,
      next: async data => {
        console.log('next subscription', data)
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
    console.log('unsub')
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

  // process
  const { post, staker } = eventData.entity
  console.log(eventData)
  const dispatch = getStoreDispatcher()
  if (!dispatch) throw new Error('Dispatcher not exist')

  dispatch(fetchSuperLikeCounts({ postIds: [post.persistentId], reload: true }))
  if (staker.id === myAddress) {
    dispatch(fetchRewardReport({ address: myAddress, reload: true }))
  }
}
