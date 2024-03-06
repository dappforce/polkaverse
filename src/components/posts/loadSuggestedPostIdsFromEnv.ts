import { SubsocialApi } from '@subsocial/api'
import config from 'src/config'
import { getPostIdsBySpaces } from 'src/graphql/apis'
import { GqlClient } from 'src/graphql/ApolloProvider'
import { AnySpaceId, PostId } from 'src/types'
import { descSort } from 'src/utils'
import { getPageOfIds } from '../utils/getIds'
import { getPinnedPost } from './pinned-post'

let suggestedPostIds: string[] | undefined = undefined

export const loadSuggestedPostIds = async ({
  client,
  subsocial,
}: {
  subsocial?: SubsocialApi
  client?: GqlClient
}) => {
  if (suggestedPostIds) return suggestedPostIds

  const recommendedIds = config.recommendedSpaceIds
  if (!config.enableSquidDataSource && subsocial) {
    const suggestedPostIdsPromises = recommendedIds.map(spaceId =>
      subsocial.blockchain.postIdsBySpaceId(spaceId as unknown as AnySpaceId),
    )

    const suggestedPostIdsArray = (await Promise.all(suggestedPostIdsPromises)).flat()

    suggestedPostIds = suggestedPostIdsArray.flat()
    return descSort(suggestedPostIds)
  } else if (client) {
    const [postIds, pinnedPostId] = await Promise.all([
      getPostIdsBySpaces(client, { spaceIds: recommendedIds }),
      getPinnedPost(client),
    ] as const)

    return Array.from(new Set([pinnedPostId, ...postIds].filter(Boolean) as string[]))
  }
  return []
}

export const getSuggestedPostIdsByPage = (ids: PostId[], size: number, page: number) =>
  getPageOfIds(ids, { page, size })
