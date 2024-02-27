// organize-imports-ignore
import '../utils/wdyr'

// TODO remove global import of all AntD CSS, use modular LESS loading instead.
// See .babelrc options: https://github.com/ant-design/babel-plugin-import#usage
import 'src/styles/antd.css'

import 'src/styles/bootstrap-utilities-4.3.1.css'
import 'src/styles/components.scss'
import 'src/styles/github-md.css'
import 'easymde/dist/easymde.min.css'

// Subsocial custom styles:
import 'src/styles/subsocial.scss'
import 'src/styles/utils.scss'
import 'src/styles/subsocial-mobile.scss'
import 'src/styles/themes.sass'

import React, { useRef, useEffect } from 'react'
import Head from 'next/head'
import MainPage from '../layout/MainPage'
import { Provider } from 'react-redux'
import { useStore } from 'src/rtk/app/store'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { DfApolloProvider } from 'src/graphql/ApolloProvider'
import { ThemeProvider } from 'next-themes'
import NextNProgress from 'nextjs-progressbar'

import config from 'src/config'
import '@subsocial/definitions/interfaces/types-lookup'
import '@subsocial/definitions/interfaces/augment-types'
import '@subsocial/definitions/interfaces/augment-api'
import AnalyticProvider, { AppLaunchedEventSender } from 'src/providers/AnalyticContext'
import { GoogleAnalytics } from 'nextjs-google-analytics'
import { DatahubSubscriber } from 'src/components/utils/datahub/subscriber'
import Script from 'next/script'
import { initAllStores } from 'src/stores/registry'
import { ReferralUrlChanger } from 'src/components/referral'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

function MyApp(props) {
  const { Component, pageProps } = props
  const store = useStore(pageProps.initialReduxState)

  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true
    initAllStores()
  }, [])

  // Debug store
  // console.log(JSON.stringify(pageProps.initialReduxState, null, 2))

  return (
    <>
      <Head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
        <link
          href='https://fonts.googleapis.com/css2?family=Unbounded:wght@500&display=swap'
          rel='stylesheet'
        />
      </Head>
      {/* Clarity Script */}
      <Script strategy='lazyOnload' id='clarity-script'>
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "kkqc95491q");
        `}
      </Script>
      <NextNProgress
        showOnShallow={false}
        color='#eb2f96'
        options={{
          showSpinner: false,
        }}
      />
      <Provider store={store}>
        {/* <AdBlockModal /> */}
        <GoogleAnalytics trackPageViews gaMeasurementId={config.ga.id} />
        <DatahubSubscriber />
        <AnalyticProvider>
          <DfApolloProvider initialApolloState={pageProps.initialApolloState}>
            <ThemeProvider defaultTheme={config.themeName}>
              <MainPage>
                <ReferralUrlChanger />
                <AppLaunchedEventSender />
                <Component {...pageProps} />
              </MainPage>
            </ThemeProvider>
          </DfApolloProvider>
        </AnalyticProvider>
      </Provider>
    </>
  )
}

export default MyApp
