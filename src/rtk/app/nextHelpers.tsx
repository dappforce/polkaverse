// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { SubsocialApi } from '@subsocial/api'
import { NextComponentType, NextPageContext } from 'next'
import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'
import { initializeApollo } from 'src/graphql/client'
import { AppDispatch, AppStore, initializeStore } from 'src/rtk/app/store'

export type NextContextWithRedux = {
  context: NextPageContext
  subsocial: SubsocialApi
  dispatch: AppDispatch
  reduxStore: AppStore
  apolloClient?: ApolloClient<NormalizedCacheObject>
}

type CbFn<Result extends {}> = (props: NextContextWithRedux) => Promise<Result>

export const getInitialPropsWithRedux = async <ResultProps extends {} = {}>(
  component: NextComponentType<NextPageContext, ResultProps, ResultProps>,
  cb?: CbFn<ResultProps>,
) =>
  (component.getInitialProps = async (context: NextPageContext) => {
    const reduxStore = initializeStore()
    const apolloClient = initializeApollo()
    let resultProps = {} as ResultProps

    if (typeof cb === 'function') {
      const { dispatch } = reduxStore
      const subsocial = await getSubsocialApi()
      resultProps = await cb({ context, subsocial, apolloClient, dispatch, reduxStore })
    }

    return {
      initialReduxState: reduxStore.getState(),
      ...resultProps,
    }
  })
