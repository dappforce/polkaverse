import {
  ApolloClient,
  NormalizedCacheObject,
  OperationVariables,
  QueryOptions,
} from '@apollo/client'
import {
  SocialCallDataArgs,
  socialCallName,
  SocialEventDataApiInput,
  SocialEventDataType,
  socialEventProtVersion,
} from '@subsocial/data-hub-sdk'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import utc from 'dayjs/plugin/utc'
import { Client, createClient } from 'graphql-ws'
import ws from 'isomorphic-ws'
import { datahubQueryUrl, datahubSubscriptionUrl } from 'src/config/env'
import { createApolloClient } from 'src/graphql/client'
import { wait } from 'src/utils/promise'
import { isServerSide } from '..'

dayjs.extend(utc)
dayjs.extend(isoWeek)

export function getDayAndWeekTimestamp(currentDate: Date = new Date()) {
  let date = dayjs.utc(currentDate)
  date = date.startOf('day')
  const week = date.get('year') * 100 + date.isoWeek()
  return { day: date.unix(), week }
}

let apolloClient: ApolloClient<NormalizedCacheObject>
function getApolloClient() {
  if (!apolloClient) return initializeDatahubApollo()
  return apolloClient
}
export const initializeDatahubApollo = (initialState: any = null) => {
  if (!datahubQueryUrl) throw new Error('Datahub (Query) config is not set')
  const _apolloClient = apolloClient ?? createApolloClient(datahubQueryUrl)

  if (initialState) {
    _apolloClient.cache.restore(initialState)
  }

  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

// QUERIES
export function datahubQueryRequest<T, TVariables extends OperationVariables>(
  config: QueryOptions<TVariables, T>,
) {
  const client = getApolloClient()
  if (isServerSide()) {
    config.fetchPolicy = 'no-cache'
  }
  return client.query(config)
}

// MUTATIONS
export type DatahubParams<T> = {
  address: string

  uuid?: string
  timestamp?: number
  proxyToAddress?: string

  args: T
}

export function createSocialDataEventPayload<T extends keyof typeof socialCallName>(
  callName: T,
  { timestamp, address, uuid, args, proxyToAddress }: DatahubParams<SocialCallDataArgs<T>>,
) {
  const owner = proxyToAddress || address

  const payload: SocialEventDataApiInput = {
    protVersion: socialEventProtVersion['0.1'],
    dataType: SocialEventDataType.offChain,
    callData: {
      name: callName,
      signer: owner || '',
      args: JSON.stringify(args),
      timestamp: timestamp || Date.now(),
      uuid: uuid || crypto.randomUUID(),
      proxy: proxyToAddress ? address : undefined,
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
