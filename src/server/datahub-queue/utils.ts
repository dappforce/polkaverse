import { KeyringPair } from '@polkadot/keyring/types'
import { u8aToHex } from '@polkadot/util'
import { SocialEventDataApiInput } from '@subsocial/data-hub-sdk'
import { GraphQLClient, RequestOptions, Variables } from 'graphql-request'
import sortKeysRecursive from 'sort-keys-recursive'
import { datahubQueueConfig } from 'src/config/env'
import { getServerAccount } from '../common'

export function datahubQueueRequest<T, V extends Variables = Variables>(
  config: RequestOptions<V, T>,
) {
  const { url, token } = datahubQueueConfig || {}
  if (!url) throw new Error('Datahub (Queue) config is not set')

  const TIMEOUT = 3 * 1000 // 3 seconds
  const client = new GraphQLClient(url, {
    timeout: TIMEOUT,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...config,
  })

  return client.request({ url, ...config })
}

export function datahubMutationWrapper<T extends (...args: any[]) => Promise<any>>(func: T) {
  return async (...args: Parameters<T>) => {
    if (!datahubQueueConfig.url || !datahubQueueConfig.token) return
    await func(...args)
  }
}

function signDatahubPayload(signer: KeyringPair | null, payload: { sig: string }) {
  if (!signer) throw new Error('Signer is not defined')
  const sortedPayload = sortKeysRecursive(payload)
  const sig = signer.sign(JSON.stringify(sortedPayload))
  const hexSig = u8aToHex(sig)
  payload.sig = hexSig
}
export const backendSigWrapper = async (input: SocialEventDataApiInput) => {
  const signer = await getServerAccount()
  if (!signer) throw new Error('Invalid Mnemonic')

  input.providerAddr = signer.address
  signDatahubPayload(signer, input)

  return input
}

export function throwErrorIfNotProcessed(
  data: { processed: boolean; message?: string | null },
  defaultMessage?: string,
) {
  if (!data.processed) {
    throw new Error(data.message ?? defaultMessage ?? 'Failed to process request')
  }
}
