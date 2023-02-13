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

import React from 'react'
import Head from 'next/head'
import MainPage from '../layout/MainPage'
import { Provider } from 'react-redux'
import { useStore } from 'src/rtk/app/store'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { DfApolloProvider } from 'src/graphql/ApolloProvider'
import { ThemeProvider } from 'next-themes'

import config from 'src/config'
import '@subsocial/definitions/interfaces/types-lookup'
import '@subsocial/definitions/interfaces/augment-types'
import '@subsocial/definitions/interfaces/augment-api'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

function MyApp(props) {
  const { Component, pageProps } = props
  const store = useStore(pageProps.initialReduxState)

  // Debug store
  // console.log(JSON.stringify(pageProps.initialReduxState, null, 2))

  return (
    <>
      <Head>
        <script src='/env.js' />
        {/*
          See how to work with custom fonts in Next.js:
          https://codeconqueror.com/blog/using-google-fonts-with-next-js
        */}
        {/* <link rel="font/ttf" href="/fonts/PTSerif-Bold.ttf" /> */}
        {/* <link rel="font/ttf" href="/fonts/NotoSerif-Bold.ttf" /> */}
        {/* <link rel="font/ttf" href="/fonts/Merriweather-Bold.ttf" /> */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='' />
        <link
          href='https://fonts.googleapis.com/css2?family=Unbounded:wght@500&display=swap'
          rel='stylesheet'
        />
      </Head>
      <Provider store={store}>
        {/* <AdBlockModal /> */}
        <DfApolloProvider initialApolloState={pageProps.initialApolloState}>
          <ThemeProvider defaultTheme={config.themeName}>
            <MainPage>
              <Component {...pageProps} />
            </MainPage>
          </ThemeProvider>
        </DfApolloProvider>
      </Provider>
    </>
  )
}

export default MyApp
