import { SocialCallDataArgs, socialCallName } from '@subsocial/data-hub-sdk'
import axios from 'axios'
import gql from 'graphql-tag'
import { PostViewCount } from 'src/rtk/features/posts/postsViewCountSlice'
import { createSocialDataEventPayload, DatahubParams, datahubQueryRequest } from './utils'

// QUERIES
const GET_POSTS_VIEW_COUNT = gql`
  query GetPostsViewCount($postIds: [String!]!) {
    postsViewsCounts(where: { persistentIds: $postIds }) {
      postPersistentId
      viewsCountTotal
    }
  }
`
export async function getPostsViewCount(postIds: string[]): Promise<PostViewCount[]> {
  const res = await datahubQueryRequest<
    {
      postsViewsCounts: { postPersistentId: string; viewsCountTotal: number }[]
    },
    { postIds: string[] }
  >({
    query: GET_POSTS_VIEW_COUNT,
    variables: { postIds },
  })

  const resultMap = new Map<string, PostViewCount>()
  res.data.postsViewsCounts.forEach(item =>
    resultMap.set(item.postPersistentId, {
      postId: item.postPersistentId,
      viewsCount: item.viewsCountTotal,
    }),
  )

  return postIds.map(
    postId =>
      resultMap.get(postId) ?? {
        postId,
        viewsCount: 0,
      },
  )
}

// MUTATIONS
export async function addPostViews(
  params: Omit<DatahubParams<SocialCallDataArgs<'synth_add_post_views_batch'>>, 'address'>,
) {
  // `signer` is using backend signer address
  const input = createSocialDataEventPayload(socialCallName.synth_add_post_views_batch, {
    ...params,
    address: '',
  })

  const res = await axios.post('/api/datahub/post-view', input)
  return res.data
}
