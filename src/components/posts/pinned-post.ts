import { getLast3CommunityHighlights } from 'src/graphql/apis'
import { GqlClient } from 'src/graphql/ApolloProvider'

const PINNED_POST_IDS: string[] = []
const PINNED_POST_ID = PINNED_POST_IDS[Math.floor(Math.random() * PINNED_POST_IDS.length)]

// precalculate the randomized index to avoid having different pinned post on multiple calls
const randomizedIndex = Math.floor(Math.random() * 3)
let randomizedPostId: string | null = null
export async function getPinnedPost(client: GqlClient | undefined) {
  if (PINNED_POST_ID) return PINNED_POST_ID
  if (randomizedPostId) return randomizedPostId
  if (!client) return null

  try {
    const postIds = await getLast3CommunityHighlights(client)
    const randomIndex = Math.min(randomizedIndex, postIds.length - 1)
    console.log(postIds, randomIndex, postIds[randomIndex])
    randomizedPostId = postIds[randomIndex]
    return randomizedPostId
  } catch (err) {
    console.log('Error getting community highlights', err)
    return null
  }
}

export function isPinnedPost(postId: string) {
  return postId === PINNED_POST_ID || postId === randomizedPostId
}
