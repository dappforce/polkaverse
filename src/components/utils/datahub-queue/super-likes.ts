import { SocialCallDataArgs, socialCallName } from '@subsocial/data-hub-sdk'
import axios from 'axios'
import { createSocialDataEventPayload, DatahubParams } from './utils'

export async function createSuperLike(
  params: DatahubParams<SocialCallDataArgs<'synth_active_staking_create_super_like'>>,
) {
  const input = createSocialDataEventPayload(
    socialCallName.synth_active_staking_create_super_like,
    params,
  )

  const res = await axios.post('/api/datahub/super-likes', input)
  return res.data
}
