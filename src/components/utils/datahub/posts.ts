import gql from 'graphql-tag'
import { datahubQueryRequest } from './utils'

// QUERIES
const GET_HOT_POSTS = gql`
  query GetHotPosts($limit: Int!, $offset: Int!, $shuffle: Boolean!) {
    activeStakingRankedPostIdsByActiveStakingActivity(
      args: { limit: $limit, offset: $offset, shuffle: $shuffle }
    ) {
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
export async function getHotPosts(variables: { offset: number; limit: number; shuffle: boolean }) {
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
    { limit: number; offset: number; shuffle: boolean }
  >({
    query: GET_HOT_POSTS,
    variables,
  })

  return res.data.activeStakingRankedPostIdsByActiveStakingActivity
}
