import { SocialEventDataApiInput } from '@subsocial/data-hub-sdk'
import { toSubsocialAddress } from '@subsocial/utils'
import { gql } from 'graphql-request'
import { getServerAccount } from '../common'
import { backendSigWrapper, datahubQueueRequest, throwErrorIfNotProcessed } from './utils'

const ADD_POST_VIEW_BATCH = gql`
  mutation AddPostViewBatch($args: CreateMutatePostOffChainDataInput!) {
    addPostViewsBatch(args: $args) {
      processed
      message
    }
  }
`
export async function addPostView(input: SocialEventDataApiInput) {
  if (!input.callData) throw new Error('Invalid callData')

  const signer = await getServerAccount()
  const signerAddress = toSubsocialAddress(signer.address)
  if (!signerAddress) throw new Error('Invalid signer address')

  input.callData.signer = signerAddress
  const signedPayload = await backendSigWrapper(input)
  const res = await datahubQueueRequest<{
    addPostViewsBatch: { processed: boolean; message: string | null }
  }>({
    document: ADD_POST_VIEW_BATCH,
    variables: {
      args: signedPayload,
    },
  })
  throwErrorIfNotProcessed(res.addPostViewsBatch, 'Failed to add post view')
}
