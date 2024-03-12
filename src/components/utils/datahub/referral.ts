import gql from 'graphql-tag'
import { datahubQueryRequest } from './utils'

const GET_REFERRER_ID = gql`
  query GetReferrerId($address: String!) {
    socialProfiles(args: { where: { substrateAddresses: [$address] } }) {
      data {
        referrersList {
          referrerId
        }
      }
    }
  }
`
export async function getReferrerId(address: string) {
  const res = await datahubQueryRequest<
    {
      socialProfiles: {
        data: {
          referrersList: {
            referrerId: string
          }[]
        }[]
      }
    },
    { address: string }
  >({
    query: GET_REFERRER_ID,
    variables: { address },
  })

  return res.data.socialProfiles.data[0].referrersList?.[0]?.referrerId
}
