import gql from 'graphql-tag'
import { LowValueIds } from 'src/rtk/features/replies/lowValueIdsSlice'
import { datahubQueryRequest } from './utils'

// QUERIES
const GET_HOT_POSTS = gql`
  query GetHotPosts($limit: Int!, $offset: Int!) {
    activeStakingRankedPostIdsByActiveStakingActivity(args: { limit: $limit, offset: $offset }) {
      data {
        postId
        persistentPostId
        rank
        score
      }
      total
    }
  }
`
export async function getHotPosts(variables: { offset: number; limit: number }) {
  const res = await datahubQueryRequest<
    {
      activeStakingRankedPostIdsByActiveStakingActivity: {
        data: {
          postId: string
          persistentPostId: string
          rank: number
          score: number
        }[]
        total: number
      }
    },
    { limit: number; offset: number }
  >({
    query: GET_HOT_POSTS,
    variables,
  })

  return res.data.activeStakingRankedPostIdsByActiveStakingActivity
}

const GET_LOW_VALUE_IDS = gql`
  query GetLowValueIds($rootPostId: String!) {
    findPosts(where: { rootPostPersistentId: $rootPostId, lowValue: true }) {
      data {
        persistentId
      }
    }
  }
`
export async function getLowValueIds(rootPostId: string): Promise<LowValueIds> {
  const res = await datahubQueryRequest<
    {
      findPosts: {
        data: {
          persistentId: string
        }[]
      }
    },
    { rootPostId: string }
  >({
    query: GET_LOW_VALUE_IDS,
    variables: { rootPostId },
  })

  return {
    rootPostId,
    lowValueIds: res.data.findPosts.data.map(post => post.persistentId),
  }
}
