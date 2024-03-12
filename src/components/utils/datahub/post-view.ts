import { SocialCallDataArgs, socialCallName } from '@subsocial/data-hub-sdk'
import axios from 'axios'
import { createSocialDataEventPayload, DatahubParams } from './utils'

// MUTATIONS
export async function addPostView(
  params: Omit<DatahubParams<SocialCallDataArgs<'synth_add_post_view'>>, 'address'>,
) {
  // `signer` is using backend signer address
  const input = createSocialDataEventPayload(socialCallName.synth_add_post_view, {
    ...params,
    address: '',
  })

  const res = await axios.post('/api/datahub/post-view', input)
  return res.data
}
