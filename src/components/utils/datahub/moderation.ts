import { isAddress } from '@polkadot/util-crypto'
import gql from 'graphql-tag'
import { CID } from 'ipfs-http-client'
import { BlockedResources } from 'src/rtk/features/moderation/blockedResourcesSlice'
import { Moderator } from 'src/rtk/features/moderation/moderatorSlice'
import { datahubQueryRequest } from './utils'

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
function getBlockedResourceType(resourceId: string): ResourceTypes | null {
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
