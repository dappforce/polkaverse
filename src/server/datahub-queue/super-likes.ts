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
  const res = await datahubQueueRequest<{
    activeStakingCreateSuperLike: { processed: boolean; message: string }
  }>({
    document: CREATE_SUPER_LIKE,
    variables: {
      createSuperLikeInput: signedPayload,
    },
  })
  if (!res.activeStakingCreateSuperLike.processed) {
    console.log('throw error', res.activeStakingCreateSuperLike.message)
    throw new Error(res.activeStakingCreateSuperLike.message)
  }
}
