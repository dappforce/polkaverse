import { SubsocialApi } from '@subsocial/api'
import config from 'src/config'
import { getPostIdsBySpaces } from 'src/graphql/apis'
import { GqlClient } from 'src/graphql/ApolloProvider'
import { AnySpaceId, bnsToIds, PostId } from 'src/types'
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

    const suggestedPostIdsArray = await Promise.all(suggestedPostIdsPromises)

    suggestedPostIds = bnsToIds(suggestedPostIdsArray.flat().sort((a, b) => b.sub(a).toNumber()))
    return suggestedPostIds
  } else if (client) {
    return getPostIdsBySpaces(client, { spaceIds: recommendedIds })
  }
  return []
}

export const getSuggestedPostIdsByPage = (ids: PostId[], size: number, page: number) =>
  getPageOfIds(ids, { page, size })
