import gql from 'graphql-tag'
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
