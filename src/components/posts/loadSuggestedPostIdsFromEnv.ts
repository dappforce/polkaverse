// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { SubsocialApi } from '@subsocial/api'
import config from 'src/config'
import { getPostIdsBySpaces } from 'src/graphql/apis'
import { GqlClient } from 'src/graphql/ApolloProvider'
import { AnySpaceId, PostId } from 'src/types'
import { getPageOfIds } from '../utils/getIds'
import { descSort } from 'src/utils'

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
    return getPostIdsBySpaces(client, { spaceIds: recommendedIds })
  }
  return []
}

export const getSuggestedPostIdsByPage = (ids: PostId[], size: number, page: number) =>
  getPageOfIds(ids, { page, size })
