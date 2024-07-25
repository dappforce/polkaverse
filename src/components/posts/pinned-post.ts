import { getLastestPostIdsInSpace } from 'src/graphql/apis'
import { GqlClient } from 'src/graphql/ApolloProvider'

const PINNED_POST_IDS: string[] = ['192597']
export const PINNED_POST_ID = PINNED_POST_IDS[Math.floor(Math.random() * PINNED_POST_IDS.length)]

const COMMUNITY_SPACE_ID = '1244'
const LATEST_LIMIT = 7

// precalculate the randomized index to avoid having different pinned post on multiple calls
const randomizedIndex = Math.floor(Math.random() * LATEST_LIMIT)
let randomizedPostId: string | null = null
export async function getPinnedPost(client: GqlClient | undefined) {
  if (PINNED_POST_ID) return PINNED_POST_ID
  if (randomizedPostId) return randomizedPostId
  if (!client) return null

  try {
    const postIds = await getLastestPostIdsInSpace(client, {
      limit: LATEST_LIMIT,
      spaceId: COMMUNITY_SPACE_ID,
    })
    const randomIndex = Math.min(randomizedIndex, postIds.length - 1)
    randomizedPostId = postIds[randomIndex]
    return randomizedPostId
  } catch (err) {
    console.log('Error getting community highlights', err)
    return null
  }
}

const COMMUNITY_POSTS_LIMIT = 5

export async function getLatestCommunityPostIds(client: GqlClient | undefined) {
  if (!client) return null

  try {
    const postIds = await getLastestPostIdsInSpace(client, {
      limit: COMMUNITY_POSTS_LIMIT,
      spaceId: COMMUNITY_SPACE_ID,
    })

    return postIds
  } catch (err) {
    console.log('Error getting community highlights', err)
    return null
  }
}

export function isPinnedPost(postId: string) {
  return postId === PINNED_POST_ID || postId === randomizedPostId
}
