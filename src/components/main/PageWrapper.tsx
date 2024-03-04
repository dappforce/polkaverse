import { isEmptyStr, nonEmptyArr, nonEmptyStr } from '@subsocial/utils'
import { summarize } from '@subsocial/utils/summarize'
import clsx from 'clsx'
import { CID } from 'ipfs-http-client'
import Head from 'next/head'
import React, { ComponentProps, FC } from 'react'
import config from 'src/config'
import { resolveIpfsUrl } from 'src/ipfs'
import SideMenu from 'src/layout/SideMenu'
import CreatorDashboardSidebar, {
  CreatorDashboardSidebarType,
} from '../creators/CreatorDashboardSidebar'
import TopUsersCard from '../creators/TopUsersCard'
import ProgressModal from '../leaderboard/ProgressModal'
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
  withSidebar?: boolean
  withVoteBanner?: boolean
  withLargerMaxWidth?: boolean
  creatorDashboardSidebarType?: CreatorDashboardSidebarType
}

// offset for making box shadow of content still visible while having the scrollbar
const BOX_SHADOW_OFFSET = 24

export const PageContent: FC<Props> = ({
  /* leftPanel, */ meta,
  rightPanel,
  level = 1,
  title,
  className,
  outerClassName,
  // withSidebar,
  children,
  withLargerMaxWidth,
  creatorDashboardSidebarType,
}) => {
  // const {
  //   showOnBoardingSidebar,
  //   // setShowOnBoardingSidebar
  // } = useShowOnBoardingSidebarContext()
  // const myAddress = useMyAddress()

  const isMobile = useIsMobileWidthOrDevice()
  // const isPanels = leftPanel || rightPanel

  const sidebarStyles = (config?: {
    withBoxShadowOffset?: boolean
    topOffset?: number
    width?: number
  }): ComponentProps<'div'> => {
    const { topOffset = 76, withBoxShadowOffset = true, width = 275 } = config || {}
    const boxShadowOffset = withBoxShadowOffset ? BOX_SHADOW_OFFSET : 0
    return {
      className: 'HideScrollbar sm-hidden',
      style: {
        width: width + boxShadowOffset * 2,
        flexShrink: 0.2,
        position: 'sticky',
        top: topOffset - boxShadowOffset,
        overflowY: 'auto',
        maxHeight: `calc(100vh - ${topOffset - boxShadowOffset}px)`,
        margin: -boxShadowOffset,
        padding: boxShadowOffset,
        zIndex: 10,
      },
    }
  }

  const sideMenuStyles = sidebarStyles({ topOffset: 64, withBoxShadowOffset: false, width: 225 })

  return (
    <>
      <HeadMeta {...meta} />

      <ProgressModal />
      {isMobile ? (
        <section className={clsx(className, 'container')}>
          {children}
          {/* {showOnBoarding && <Affix offsetBottom={5}><OnBoardingMobileCard /></Affix>} */}
        </section>
      ) : (
        <div className={clsx('DfSectionOuterContainer container')}>
          {creatorDashboardSidebarType && (
            <div
              {...sideMenuStyles}
              className='xl-only DfSideBar pt-2'
              style={{
                height: `calc(100vh - ${76 - BOX_SHADOW_OFFSET}px)`,
                borderRight: '1px solid #CBD5E1',
                marginTop: '-12px',
                ...sideMenuStyles.style,
              }}
            >
              <SideMenu noOffset />
            </div>
          )}
          <section
            className={clsx(
              'DfSectionOuter',
              'w-100',
              withLargerMaxWidth && 'DfSectionLarger',
              outerClassName,
            )}
          >
            {/* {isPanels && <div className='DfLeftPanel DfPanel'>{leftPanel}</div>} */}
            <Section
              withLargerMaxWidth={withLargerMaxWidth}
              className={outerClassName}
              outerClassName={outerClassName}
            >
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
                withLargerMaxWidth={withLargerMaxWidth}
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
          {rightPanel === undefined && creatorDashboardSidebarType && (
            <div {...sidebarStyles()}>
              <CreatorDashboardSidebar dashboardType={creatorDashboardSidebarType} />
              <div className='mt-3'>
                <TopUsersCard />
              </div>
              {/* <OnBoardingSidebar hideOnBoardingSidebar={() => setShowOnBoardingSidebar(false)} /> */}
            </div>
          )}
        </div>
      )}
    </>
  )
}
