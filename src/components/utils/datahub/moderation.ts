import { isAddress } from '@polkadot/util-crypto'
import { DataHubSubscriptionEventEnum } from '@subsocial/data-hub-sdk'
import { gql as gqlRequest } from 'graphql-request'
import gql from 'graphql-tag'
import { CID } from 'ipfs-http-client'
import { appId } from 'src/config/env'
import { getStoreDispatcher } from 'src/rtk/app/store'
import {
  BlockedResources,
  updateBlockedResources,
} from 'src/rtk/features/moderation/blockedResourcesSlice'
import { Moderator } from 'src/rtk/features/moderation/moderatorSlice'
import { datahubQueryRequest, datahubSubscription } from './utils'

export const GET_MODERATOR_DATA = gql`
  query GetModeratorData($address: String!) {
    moderators(args: { where: { substrateAddress: $address } }) {
      data {
        moderatorOrganizations {
          organization {
            id
            ctxPostIds
            ctxAppIds
          }
        }
      }
    }
  }
`
type GetModeratorDataQueryVariables = { address: string }
export async function getModeratorData(
  variables: GetModeratorDataQueryVariables,
): Promise<Moderator> {
  const res = await datahubQueryRequest<
    {
      moderators?: {
        data: {
          moderatorOrganizations?: Array<{
            organization: {
              id: string
              ctxPostIds?: string[] | null
              ctxAppIds?: string[] | null
            }
          }> | null
        }[]
      } | null
    },
    GetModeratorDataQueryVariables
  >({
    query: GET_MODERATOR_DATA,
    variables,
  })

  const moderator = res.data.moderators?.data?.[0]
  const postIds: string[] = []
  const appIds: string[] = []
  moderator?.moderatorOrganizations?.forEach(org => {
    postIds.push(...(org.organization.ctxPostIds ?? []))
    appIds.push(...(org.organization.ctxAppIds ?? []))
  })
  const firstOrg = moderator?.moderatorOrganizations?.[0]
  return {
    address: variables.address,
    postIds,
    appIds,
    exist: !!moderator,
    organizationId: firstOrg?.organization.id,
  }
}

const GET_BLOCKED_RESOURCES_IN_APP = gql`
  query GetBlockedResources($appId: String!) {
    moderationBlockedResourceIds(ctxAppIds: [$appId])
  }
`
export async function getBlockedResourcesInApp(appId: string): Promise<BlockedResources> {
  const res = await datahubQueryRequest<
    { moderationBlockedResourceIds: string[] },
    { appId: string }
  >({
    query: GET_BLOCKED_RESOURCES_IN_APP,
    variables: { appId },
  })
  return {
    id: appId,
    resources: mapBlockedResources(res.data.moderationBlockedResourceIds, id => id),
  }
}
export type ResourceTypes = 'cid' | 'address' | 'postId'
function mapBlockedResources<T>(resources: T[], getId: (t: T) => string) {
  const data: Record<ResourceTypes, T[]> = {
    cid: [],
    address: [],
    postId: [],
  }
  resources.forEach(resource => {
    const resourceId = getId(resource)
    const type = getBlockedResourceType(resourceId)
    if (!type) return

    data[type].push(resource)
  })
  return data
}
export function getBlockedResourceType(resourceId: string): ResourceTypes | null {
  if (isPostId(resourceId) || resourceId.startsWith('0x')) return 'postId'
  if (isValidSubstrateAddress(resourceId)) return 'address'
  if (isValidCID(resourceId)) return 'cid'

  return null
}
function isValidSubstrateAddress(maybeAddress: string) {
  try {
    return isAddress(maybeAddress)
  } catch (error) {
    return false
  }
}
function isValidCID(maybeCid: string | number) {
  if (!maybeCid) return false

  try {
    if (typeof maybeCid === 'string') return !!CID.parse(maybeCid)
    return !!CID.asCID(maybeCid)
  } catch (e) {
    return false
  }
}
function isPostId(maybePostId: string) {
  if (typeof maybePostId === 'string' && !/^\d+$/.test(maybePostId)) return false

  return true
}

// SUBSCRIPTION
const SUBSCRIBE_BLOCKED_RESOURCES = gqlRequest`
  subscription SubscribeBlockedResources {
    moderationBlockedResource {
      event
      entity {
        id
        blocked
        resourceId
        ctxAppIds
        organization {
          ctxAppIds
        }
      }
    }
  }
`
export type SubscribeBlockedResourcesSubscription = {
  moderationBlockedResource: {
    event: DataHubSubscriptionEventEnum
    entity: {
      id: string
      blocked: boolean
      resourceId: string
      ctxAppIds: Array<string>
      rootPostId?: string | null
      organization: {
        ctxAppIds?: Array<string> | null
      }
    }
  }
}

let isSubscribed = false
export function subscribeModeration() {
  if (isSubscribed) return
  isSubscribed = true

  const client = datahubSubscription()
  let unsubBlockedResources = client.subscribe<SubscribeBlockedResourcesSubscription, null>(
    {
      query: SUBSCRIBE_BLOCKED_RESOURCES,
    },
    {
      complete: () => undefined,
      next: async data => {
        const eventData = data.data?.moderationBlockedResource
        if (!eventData) return

        await processBlockedResourcesEvent(eventData)
      },
      error: err => {
        console.error('error blocked resources subscription', err)
      },
    },
  )

  return () => {
    unsubBlockedResources()
    isSubscribed = false
  }
}

const processedJustNowIds = new Set<string>()
async function processBlockedResourcesEvent(
  eventData: SubscribeBlockedResourcesSubscription['moderationBlockedResource'],
) {
  if (
    eventData.event === DataHubSubscriptionEventEnum.MODERATION_BLOCKED_RESOURCE_STATE_UPDATED ||
    eventData.event === DataHubSubscriptionEventEnum.MODERATION_BLOCKED_RESOURCE_CREATED
  ) {
    // prevent double processing of the same event
    // because now if we block resource we get 2 events simultaneously
    if (
      eventData.event === DataHubSubscriptionEventEnum.MODERATION_BLOCKED_RESOURCE_CREATED &&
      eventData.entity.blocked
    ) {
      processedJustNowIds.add(eventData.entity.id)
      setTimeout(() => {
        processedJustNowIds.delete(eventData.entity.id)
      }, 1000)
    } else if (
      processedJustNowIds.has(eventData.entity.id) &&
      eventData.event === DataHubSubscriptionEventEnum.MODERATION_BLOCKED_RESOURCE_STATE_UPDATED &&
      eventData.entity.blocked
    ) {
      return
    }
    await processBlockedResources(eventData)
  }
}

async function processBlockedResources(
  eventData: SubscribeBlockedResourcesSubscription['moderationBlockedResource'],
) {
  const entity = eventData.entity
  const { blocked: isNowBlocked, resourceId } = entity
  const resourceType = getBlockedResourceType(resourceId)

  if (!resourceType) return

  const ctxAppIds = entity.organization.ctxAppIds
  const entityAppId = entity.ctxAppIds

  const isBlockedInAppContext = entityAppId.some(id => id === appId || id === '*')
  const isAppContextRelated = appId && ctxAppIds?.includes(appId) && isBlockedInAppContext

  if (!isAppContextRelated) return

  const dispatch = getStoreDispatcher()
  dispatch?.(
    updateBlockedResources({
      id: appId,
      type: isNowBlocked ? 'add' : 'remove',
      idToProcess: resourceId,
    }),
  )
}
