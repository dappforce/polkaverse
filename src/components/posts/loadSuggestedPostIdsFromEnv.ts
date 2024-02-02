import { SubsocialApi } from '@subsocial/api'
import config from 'src/config'
import { PINNED_POST_IDS } from 'src/config/constants'
import { getPostIdsBySpaces } from 'src/graphql/apis'
import { GqlClient } from 'src/graphql/ApolloProvider'
import { AnySpaceId, PostId } from 'src/types'
import { descSort } from 'src/utils'
import { getPageOfIds } from '../utils/getIds'

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
    const postIds = await getPostIdsBySpaces(client, { spaceIds: recommendedIds })
    return Array.from(new Set([...PINNED_POST_IDS, ...postIds]))
  }
  return []
}

export const getSuggestedPostIdsByPage = (ids: PostId[], size: number, page: number) =>
  getPageOfIds(ids, { page, size })
