import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
  useApolloClient,
} from '@apollo/client'
import { FC } from 'react'
import config from 'src/config'
import { useApollo } from './client'

type ApolloProviderProps = {
  initialApolloState: NormalizedCacheObject
}

export type GqlClient = ApolloClient<object>

export const DfApolloProvider: FC<ApolloProviderProps> = ({ children, initialApolloState }) => {
  const apolloClient = useApollo(initialApolloState)

  if (!apolloClient) return <>{children}</>

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}

// eslint-disable-next-line react-hooks/rules-of-hooks
export const useDfApolloClient = () => (config.enableGraphQl ? useApolloClient() : undefined)
