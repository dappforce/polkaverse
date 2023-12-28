import { SocialEventDataApiInput } from '@subsocial/data-hub-sdk'
import { gql } from 'graphql-request'
import { backendSigWrapper, datahubQueueRequest } from './utils'

const CREATE_SUPER_LIKE = gql`
  mutation CreateSuperLike($createSuperLikeInput: CreateMutateActiveStakingSuperLikeInput!) {
    activeStakingCreateSuperLike(args: $createSuperLikeInput) {
      processed
      message
    }
  }
`

export async function createSuperLikeServer(input: SocialEventDataApiInput) {
  const signedPayload = await backendSigWrapper(input)
  await datahubQueueRequest({
    document: CREATE_SUPER_LIKE,
    variables: {
      createSuperLikeInput: signedPayload,
    },
  })
}
