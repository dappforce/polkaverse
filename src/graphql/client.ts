import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { useMemo } from 'react'
import { isServerSide } from 'src/components/utils'
import config from 'src/config'

const { enableGraphQl, graphqlUrl } = config

export let apolloClient: ApolloClient<NormalizedCacheObject>

const createApolloClient = (graphqlUrl: string): ApolloClient<NormalizedCacheObject> => {
  return new ApolloClient({
    uri: graphqlUrl,
    cache: new InMemoryCache(),
  })
}

export const initializeApollo = (initialState: any = null) => {
  if (!enableGraphQl || !graphqlUrl) return undefined

  const _apolloClient = apolloClient ?? createApolloClient(graphqlUrl)

  if (initialState) {
    _apolloClient.cache.restore(initialState)
  }

  if (isServerSide()) return _apolloClient

  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export const useApollo = (initialState: NormalizedCacheObject) => {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
