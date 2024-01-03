import {
  SocialCallDataArgs,
  socialCallName,
  SocialEventDataApiInput,
  SocialEventDataType,
  socialEventProtVersion,
} from '@subsocial/data-hub-sdk'
import { GraphQLClient, RequestOptions, Variables } from 'graphql-request'
import { Client, createClient } from 'graphql-ws'
import ws from 'isomorphic-ws'
import { datahubQueryUrl, datahubSubscriptionUrl } from 'src/config/env'
import { wait } from 'src/utils/promise'

// QUERIES
export function datahubQueryRequest<T, V extends Variables = Variables>(
  config: RequestOptions<V, T>,
) {
  if (!datahubQueryUrl) throw new Error('Datahub (Query) config is not set')

  const TIMEOUT = 10 * 1000 // 10 seconds
  const client = new GraphQLClient(datahubQueryUrl, {
    timeout: TIMEOUT,
    ...config,
  })

  return client.request({ url: datahubQueryUrl, ...config })
}

// MUTATIONS
export type DatahubParams<T> = {
  address: string

  uuid?: string
  timestamp?: number

  args: T
}

export function createSocialDataEventPayload<T extends keyof typeof socialCallName>(
  callName: T,
  { timestamp, address, uuid, args }: DatahubParams<SocialCallDataArgs<T>>,
) {
  const payload: SocialEventDataApiInput = {
    protVersion: socialEventProtVersion['0.1'],
    dataType: SocialEventDataType.offChain,
    callData: {
      name: callName,
      signer: address || '',
      args: JSON.stringify(args),
      timestamp: timestamp || Date.now(),
      uuid: uuid || crypto.randomUUID(),
    },
    providerAddr: address,
    sig: '',
  }
  return payload
}

// SUBSCRIPTION
let client: Client | null = null
function getClient() {
  if (!datahubSubscriptionUrl) throw new Error('Datahub (Subscription) config is not set')
  if (!client) {
    client = createClient({
      webSocketImpl: ws,
      url: datahubSubscriptionUrl,
      shouldRetry: () => true,
      retryWait: async attempt => {
        await wait(2 ** attempt * 1000)
      },
    })
  }
  return client
}
export function datahubSubscription() {
  return getClient()
}
