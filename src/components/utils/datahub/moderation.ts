import gql from 'graphql-tag'
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
