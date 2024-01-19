import dayjs from 'dayjs'
import gql from 'graphql-tag'
import { TopUsers } from 'src/rtk/features/leaderboard/topUsersSlice'
import { datahubQueryRequest, getDayAndWeekTimestamp } from './utils'

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
  const now = getDayAndWeekTimestamp().day
  const from = dayjs(now).subtract(1, 'day').valueOf().toString()
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
