import { isEmptyStr, nonEmptyArr, nonEmptyStr } from '@subsocial/utils'
import { summarize } from '@subsocial/utils/summarize'
import clsx from 'clsx'
import { CID } from 'ipfs-http-client'
import Head from 'next/head'
import React, { FC } from 'react'
import config from 'src/config'
import { resolveIpfsUrl } from 'src/ipfs'
import { useMyAddress } from '../auth/MyAccountsContext'
import CreatorDashboardSidebar from '../creators/CreatorDashboardSidebar'
import { useShowOnBoardingSidebarContext } from '../onboarding/contexts/ShowOnBoardingSidebarContext'
import { useIsMobileWidthOrDevice } from '../responsive'
import { fullUrl } from '../urls/helpers'
import Section from '../utils/Section'

const { metaTags, canonicalUrl, appBaseUrl } = config

export type HeadMetaProps = {
  forceTitle?: boolean
  title: string
  desc?: string
  image?: string
  canonical?: string
  externalCanonical?: string
  tags?: string[]
}

// Google typically displays the first 50–60 characters of a title tag.
// If you keep your titles under 60 characters, our research suggests
// that you can expect about 90% of your titles to display properly.
const MAX_TITLE_LEN = 45
const MAX_DESC_LEN = 300

const optimizeTitle = (title: string) => {
  if (isEmptyStr(title) || title === metaTags.title) {
    return metaTags.title
  }

  const leftPart = summarize(title, { limit: MAX_TITLE_LEN })
  return `${leftPart} - ${config.appName}`
}

// CID object don't have `isCid` method, so need to use `parse` and catch error
const resolveIpfsOrLocalUrl = (url: string) => {
  try {
    return resolveIpfsUrl(CID.parse(url).toString())
  } catch {
    return fullUrl(url)
  }
}

export function HeadMeta(props: HeadMetaProps) {
  const { forceTitle, title, desc, image, canonical, externalCanonical, tags } = props
  const summary = desc ? summarize(desc, { limit: MAX_DESC_LEN }) : metaTags.desc
  const img = nonEmptyStr(image) ? resolveIpfsOrLocalUrl(image) : fullUrl(metaTags.defaultImage)

  return (
    <div>
      <Head>
        <title>{forceTitle ? title : optimizeTitle(title)}</title>
        <meta name='description' content={summary} />
        {nonEmptyArr(tags) && <meta name='keywords' content={tags?.join(', ')} />}
        {nonEmptyStr(canonical) && (
          <link
            rel='canonical'
            href={
              externalCanonical?.startsWith(appBaseUrl)
                ? fullUrl(canonical, canonicalUrl)
                : externalCanonical
            }
          />
        )}

        <meta property='og:site_name' content={metaTags.siteName} />
        <meta property='og:image' content={img} />
        <meta property='og:title' content={title} />
        <meta property='og:description' content={summary} />

        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content={metaTags.siteName} />
        <meta name='twitter:image' content={img} />
        <meta name='twitter:title' content={title} />
        <meta name='twitter:description' content={summary} />
      </Head>
    </div>
  )
}

type Props = {
  meta: HeadMetaProps
  leftPanel?: React.ReactNode
  rightPanel?: React.ReactNode
  level?: number
  title?: React.ReactNode
  className?: string
  outerClassName?: string
  withOnBoarding?: boolean
  withVoteBanner?: boolean
}

const ONBOARDING_SIDEBAR_WIDTH = 300

export const PageContent: FC<Props> = ({
  /* leftPanel, */ meta,
  rightPanel,
  level = 1,
  title,
  className,
  outerClassName,
  withOnBoarding,
  children,
}) => {
  const {
    showOnBoardingSidebar,
    // setShowOnBoardingSidebar
  } = useShowOnBoardingSidebarContext()
  const myAddress = useMyAddress()

  const isMobile = useIsMobileWidthOrDevice()
  // const isPanels = leftPanel || rightPanel
  return (
    <>
      <HeadMeta {...meta} />

      {isMobile ? (
        <section className={className}>
          {children}
          {/* {showOnBoarding && <Affix offsetBottom={5}><OnBoardingMobileCard /></Affix>} */}
        </section>
      ) : (
        <div className={clsx('DfSectionOuterContainer')}>
          <section className={clsx('DfSectionOuter', 'w-100', outerClassName)}>
            {/* {isPanels && <div className='DfLeftPanel DfPanel'>{leftPanel}</div>} */}
            <Section className={outerClassName} outerClassName={outerClassName}>
              {/* <Alert
                className='mb-2'
                message='Maintenance Alert'
                type='warning'
                showIcon
                description={<>
                  {'Subsocial’s web app is undergoing maintenance as we transition from our solochain to our parachain. During this time, the app will be in read-only mode, and users will not be able to interact with it. '}
                  <Link href='https://app.subsocial.network/@subsocial/subsocial-web-app-maintenance-35395'>Learn more.</Link>
                </>}
              /> */}
              <Section
                className={`${className}`}
                outerClassName={outerClassName}
                level={level}
                title={title}
              >
                {children}
              </Section>
            </Section>
            {/* {isPanels && <div className='DfRightPanel DfPanel'>{rightPanel}</div>} */}
          </section>
          {rightPanel}
          {rightPanel === undefined && withOnBoarding && showOnBoardingSidebar && myAddress && (
            <div style={{ width: ONBOARDING_SIDEBAR_WIDTH, flexShrink: 0.2 }}>
              <CreatorDashboardSidebar />
              {/* <OnBoardingSidebar hideOnBoardingSidebar={() => setShowOnBoardingSidebar(false)} /> */}
            </div>
          )}
        </div>
      )}
    </>
  )
}
