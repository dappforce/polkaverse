import { SocialCallDataArgs, socialCallName } from '@subsocial/data-hub-sdk'
import axios from 'axios'
import { gql } from 'graphql-request'
import { createSocialDataEventPayload, DatahubParams, datahubQueryRequest } from './utils'

// QUERIES
const GET_SUPER_LIKE_COUNTS = gql`
  query GetSuperLikeCounts($postIds: [String!]!) {
    activeStakingSuperLikeCountsByPost(args: { postPersistentIds: $postIds }) {
      persistentPostId
      count
    }
  }
`
export async function getSuperLikeCounts(postIds: string[]) {
  const res = (await datahubQueryRequest({
    document: GET_SUPER_LIKE_COUNTS,
    variables: { postIds },
  })) as {
    activeStakingSuperLikeCountsByPost: {
      persistentPostId: string
      count: number
    }[]
  }

  return res.activeStakingSuperLikeCountsByPost.map(item => ({
    postId: item.persistentPostId,
    count: item.count,
  }))
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
