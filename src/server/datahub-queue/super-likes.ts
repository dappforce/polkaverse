import { SocialCallDataArgs, SocialEventDataApiInput } from '@subsocial/data-hub-sdk'
import { gql } from 'graphql-request'
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { backendSigWrapper, datahubQueueRequest } from './utils'

const GET_SUPER_LIKE_CONFIRMATION_MSG = gql`
  query GetSuperLikeConfirmationMsg {
    activeStakingConfirmationMessage {
      message
      week
    }
  }
`

export async function getSuperLikeConfirmationMsg() {
  const res = await datahubQueueRequest<
    {
      activeStakingConfirmationMessage: {
        message: string
      }
    },
    {}
  >({
    document: GET_SUPER_LIKE_CONFIRMATION_MSG,
    variables: {},
  })

  return {
    message: res.activeStakingConfirmationMessage.message ?? '',
  }
}

const CREATE_SUPER_LIKE = gql`
  mutation CreateSuperLike($createSuperLikeInput: CreateMutateActiveStakingSuperLikeInput!) {
    activeStakingCreateSuperLike(args: $createSuperLikeInput) {
      processed
      message
    }
  }
`

export async function createSuperLikeServer(input: SocialEventDataApiInput) {
  const args: SocialCallDataArgs<'synth_active_staking_create_super_like'> = JSON.parse(
    input.callData.args || '{}',
  )
  const substrateApi = await getSubsocialApi().substrateApi
  const blockHash = await substrateApi.rpc.chain.getBlockHash()

  args.blockHash = blockHash.toString()
  input.callData.args = JSON.stringify(args)

  input.callData.timestamp = Date.now()

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
