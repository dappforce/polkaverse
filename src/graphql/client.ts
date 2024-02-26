import { ApolloClient, DefaultOptions, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { useMemo } from 'react'
import { isServerSide } from 'src/components/utils'
import config from 'src/config'

const { enableGraphQl, graphqlUrl } = config

let apolloClient: ApolloClient<NormalizedCacheObject>

export function getApolloClient() {
  if (!apolloClient) return initializeApollo()
  return apolloClient
}

export const createApolloClient = (
  graphqlUrl: string,
  withServerCache = false,
): ApolloClient<NormalizedCacheObject> => {
  let config: DefaultOptions = {}
  if (isServerSide() && !withServerCache) {
    config = {
      query: {
        fetchPolicy: 'no-cache',
      },
    }
  }

  return new ApolloClient({
    uri: graphqlUrl,
    defaultOptions: config,
    cache: new InMemoryCache(),
  })
}

export const initializeApollo = (initialState: any = null, withServerCache = false) => {
  if (!enableGraphQl || !graphqlUrl) return undefined
  if (isServerSide()) return createApolloClient(graphqlUrl, withServerCache)

  const _apolloClient = apolloClient ?? createApolloClient(graphqlUrl)

  if (initialState) {
    _apolloClient.cache.restore(initialState)
  }

  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

export const useApollo = (initialState?: NormalizedCacheObject) => {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
