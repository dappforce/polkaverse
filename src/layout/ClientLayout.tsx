import dynamic from 'next/dynamic'
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

const Navigation = dynamic(() => import('./Navigation'), {
  ssr: false,
})

const ChatFloatingModal = dynamic(() => import('../components/chat/ChatFloatingModal'), {
  ssr: false,
})

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
                    <ChatFloatingModal />
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
