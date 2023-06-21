// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import { NotifCounterProvider } from 'src/components/activity/NotifCounter'
import { LazyConnectionsProvider } from 'src/components/lazy-connection/LazyConnectionContext'
import OnBoardingContextsWrapper from 'src/components/onboarding/contexts/OnBoardingContextsWrapper'
import { ResponsiveSizeProvider } from 'src/components/responsive'
import config from 'src/config'
import { initGa } from 'src/ga'
import { AuthProvider } from '../components/auth/AuthContext'
import { MyAccountsProvider } from '../components/auth/MyAccountsContext'
import { SubstrateProvider, SubstrateWebConsole } from '../components/substrate'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext'
import { Navigation } from './Navigation'

initGa(config.ga)

const ClientLayout: React.FunctionComponent = ({ children }) => {
  return (
    <ResponsiveSizeProvider>
      <SidebarCollapsedProvider>
        <OnBoardingContextsWrapper>
          <SubstrateProvider endpoint={config.substrateUrl}>
            <LazyConnectionsProvider>
              <SubstrateWebConsole />
              <MyAccountsProvider>
                <AuthProvider>
                  <NotifCounterProvider>
                    <Navigation>{children}</Navigation>
                  </NotifCounterProvider>
                </AuthProvider>
              </MyAccountsProvider>
            </LazyConnectionsProvider>
          </SubstrateProvider>
        </OnBoardingContextsWrapper>
      </SidebarCollapsedProvider>
    </ResponsiveSizeProvider>
  )
}

export default ClientLayout
