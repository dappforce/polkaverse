// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
  initialApolloState?: NormalizedCacheObject
}

export type GqlClient = ApolloClient<object>

export const DfApolloProvider: FC<ApolloProviderProps> = ({ children, initialApolloState }) => {
  const apolloClient = useApollo(initialApolloState)

  if (!apolloClient) return <>{children}</>

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}

// eslint-disable-next-line react-hooks/rules-of-hooks
export const useDfApolloClient = () => (config.enableGraphQl ? useApolloClient() : undefined)
