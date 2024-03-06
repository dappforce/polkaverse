import dynamic from 'next/dynamic'
import React from 'react'
import { NotifCounterProvider } from 'src/components/activity/NotifCounter'
import { LazyConnectionsProvider } from 'src/components/lazy-connection/LazyConnectionContext'
import OnBoardingContextsWrapper from 'src/components/onboarding/contexts/OnBoardingContextsWrapper'
import { ResponsiveSizeProvider } from 'src/components/responsive'
import MaintenancePage from 'src/components/utils/maintenancePage'
import config from 'src/config'
import { useIsMyAddressWhitelisted } from 'src/config/constants'
import { isEnabledMaintenancePage } from 'src/config/env'
import { AuthProvider } from '../components/auth/AuthContext'
import { MyAccountsProvider } from '../components/auth/MyAccountsContext'
import { SubstrateProvider, SubstrateWebConsole } from '../components/substrate'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext'
import { Navigation } from './Navigation'

const ChatFloatingModal = dynamic(() => import('../components/chat/ChatFloatingModal'), {
  ssr: false,
})

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
                  <MaintenancePageWrapper>
                    <NotifCounterProvider>
                      <Navigation>{children}</Navigation>
                      <ChatFloatingModal />
                    </NotifCounterProvider>
                  </MaintenancePageWrapper>
                </AuthProvider>
              </MyAccountsProvider>
            </LazyConnectionsProvider>
          </SubstrateProvider>
        </OnBoardingContextsWrapper>
      </SidebarCollapsedProvider>
    </ResponsiveSizeProvider>
  )
}

const MaintenancePageWrapper: React.FunctionComponent = ({ children }) => {
  const isWhitelisted = useIsMyAddressWhitelisted()

  if (isEnabledMaintenancePage() && !isWhitelisted) return <MaintenancePage />

  return <>{children}</>
}

export default ClientLayout
