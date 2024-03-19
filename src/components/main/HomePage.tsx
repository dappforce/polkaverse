import { UpOutlined } from '@ant-design/icons'
import { Affix, BackTop, Button, Tabs, Tooltip } from 'antd'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import config from 'src/config'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { useAppSelector } from 'src/rtk/app/store'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { selectSpaceIdsByFollower } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import { useMyAccount } from 'src/stores/my-account'
import { PostKind } from 'src/types/graphql-global-types'
import { getAmountRange } from 'src/utils/analytics'
import { useIsSignedIn, useMyAddress } from '../auth/MyAccountsContext'
import { CreatorDashboardHomeVariant } from '../creators/CreatorDashboardSidebar'
import MobileActiveStakingSection from '../creators/MobileActiveStakingSection'
import { ShowLikeablePostsProvider } from '../posts/ShowLikeablePostsContext'
import WriteSomething from '../posts/WriteSomething'
import { useReferralId } from '../referral/ReferralUrlChanger'
import { useIsMobileWidthOrDevice } from '../responsive'
import { CreatorsSpaces } from '../spaces/LatestSpacesPage'
import Section from '../utils/Section'
import style from './HomePage.module.sass'
import { dateFilterOpt, Filters, PostFilterView, SpaceFilterView } from './HomePageFilters'
import { PageContent } from './PageWrapper'
import {
  DateFilterType,
  EntityFilter,
  FilterType,
  PostFilterType,
  SpaceFilterType,
  TabKeys,
} from './types'
import { getFilterType, setFiltersInUrl, tabs } from './utils'

const MyFeed = dynamic(import('../activity/MyFeed'))
// import { CrowdloanProgress } from 'src/components/crowdloan/progress/ProgressSection'

const { enableGraphQl, metaTags } = config

const { TabPane } = Tabs

type Props = {
  totalPostCount: number
  totalSpaceCount: number
}

type TabsProps = {
  tabKey: TabKeys
  totalPostCount: number
  totalSpaceCount: number
  setKey: OnChangeKeyFn
  className?: string

  isAffix?: boolean
}

type AffixTabsProps = TabsProps & {
  visible: boolean
}

type OnChangeKeyFn = (key: string) => void

const HomeTabs = (props: TabsProps) => {
  const { tabKey, setKey, className, isAffix } = props

  return (
    <>
      <Tabs activeKey={tabKey} onChange={setKey} className={`${className} ${style.DfTabs}`}>
        <TabPane tab='My feed' key='feed' />
        <TabPane tab='Posts' key='posts' />
        <TabPane tab={enableGraphQl ? 'Spaces' : 'Polkadot Spaces'} key='spaces' />
      </Tabs>
      <Filters tabKey={tabKey} isAffix={isAffix} />
    </>
  )
}

const AffixTabs = (props: AffixTabsProps) => {
  return (
    <Affix offsetTop={64} className={'visible'}>
      <HomeTabs className={style.AffixTabs} isAffix {...props} />
    </Affix>
  )
}

const ToTopIcon = <UpOutlined />

const TabsHomePage = ({
  setCurrentTabVariant,
  ...props
}: Props & {
  setCurrentTabVariant: (variant: CreatorDashboardHomeVariant) => void
}) => {
  const refId = useReferralId()
  const isSignedIn = useIsSignedIn()
  const router = useRouter()
  let prevScrollpos = 0

  const [hidden, setHidden] = useState(false)

  const getFiltersFromUrl = () => {
    let {
      tab: tabFromUrl = isSignedIn ? 'feed' : 'posts',
      date: dateFromUrl = 'week',
      type: typeFromUrl = 'suggested',
    } = router.query

    const tabIndex = tabs.findIndex(tab => tab === tabFromUrl)

    const dateFilterIndex = dateFilterOpt.findIndex(date => date.value === dateFromUrl)

    return {
      tabIndex: tabIndex < 0 ? 0 : tabIndex,
      typeFromUrl: typeFromUrl as string,
      dateFilterIndex: dateFilterIndex < 0 ? 0 : dateFilterIndex,
    }
  }

  const { tabIndex, typeFromUrl, dateFilterIndex } = getFiltersFromUrl()
  const tab = tabs[tabIndex] as TabKeys
  const type = getFilterType(tab, typeFromUrl)
  const date = dateFilterOpt[dateFilterIndex].value as DateFilterType

  const myAddress = useMyAddress() ?? ''
  const { data: totalStake } = useFetchTotalStake(myAddress)

  const sendEvent = useSendEvent()
  useEffect(() => {
    sendEvent('home_page_tab_opened', {
      type: tab,
      value: type,
      amountRange: getAmountRange(totalStake?.amount),
    })
  }, [tab, type])

  useEffect(() => {
    let variant: CreatorDashboardHomeVariant = 'posts'
    if (tab === 'spaces') variant = 'spaces'
    setCurrentTabVariant(variant)
  }, [setCurrentTabVariant, tab])

  const onChangeKey = (key: string) => {
    const typeValue = getFilterType(key, type)
    const filterType =
      key !== 'feed' ? ({ type: typeValue, date } as FilterType<EntityFilter>) : undefined

    setFiltersInUrl(router, key, filterType, { ref: refId })
  }

  const isInitializedProxy = useMyAccount(state => state.isInitializedProxy)
  const followedIds = useAppSelector(state => {
    return selectSpaceIdsByFollower(state, myAddress)
  })

  const isLoadingFollowedIds = followedIds === undefined
  useEffect(() => {
    if (!isInitializedProxy || !isSignedIn || isLoadingFollowedIds) return
    if (followedIds.length === 0) {
      setFiltersInUrl(router, 'posts', { type: 'hot' }, { ref: refId })
    } else {
      onChangeKey(tab)
    }
  }, [followedIds, isInitializedProxy])

  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset
    if (prevScrollpos > currentScrollPos && currentScrollPos > 500) setHidden(true)
    else setHidden(false)
    prevScrollpos = currentScrollPos
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const TabsContent = useCallback(() => {
    if (tab === 'feed') {
      return <MyFeed />
    } else if (tab === 'posts') {
      return (
        <>
          {myAddress && <WriteSomething className='mt-3' />}
          <PostFilterView
            kind={PostKind.RegularPost}
            filter={{ type: type as PostFilterType, date }}
            {...props}
          />
        </>
      )
    } else if (tab === 'spaces') {
      return <SpaceFilterView filter={{ type: type as SpaceFilterType, date }} {...props} />
    } else {
      return <CreatorsSpaces />
    }
  }, [tab, type, date, myAddress])
  const isMobile = useIsMobileWidthOrDevice()

  return (
    <>
      <MobileActiveStakingSection />
      {/* <div className={clsx(isMobile ? 'mt-3' : '')}>
        <CommentBanner />
      </div> */}
      <ShowLikeablePostsProvider tab={tab} filter={type}>
        {!isMobile && <AffixTabs tabKey={tab} setKey={onChangeKey} visible={hidden} {...props} />}
        <Section className='m-0'>
          {isMobile && (
            <HomeTabs tabKey={tab} className='DfHomeTab' setKey={onChangeKey} {...props} />
          )}
          <TabsContent />
          <Tooltip title={'Back to top'} placement={'right'}>
            <BackTop className={style.DfBackToTop}>
              <Button size={'large'} icon={ToTopIcon} />
            </BackTop>
          </Tooltip>
        </Section>
      </ShowLikeablePostsProvider>
    </>
  )
}

const HomePage: NextPage<Props> = props => {
  const [currentTabVariant, setCurrentTabVariant] = useState<CreatorDashboardHomeVariant>('posts')

  return (
    <>
      <PageContent
        meta={{ title: metaTags.title, desc: metaTags.desc }}
        className='m-0'
        withSidebar
        creatorDashboardSidebarType={{
          name: 'home-page',
          variant: currentTabVariant,
        }}
      >
        {/* <CrowdloanProgress /> */}
        {/* <GetSubBanner /> */}
        <TabsHomePage {...props} setCurrentTabVariant={setCurrentTabVariant} />
      </PageContent>
    </>
  )
}

getInitialPropsWithRedux(HomePage, async () => {
  // This query is made static, because its not really important to be precise, and want to avoid long fetching time
  // Data queried at 16th March 2024
  let totalPostCount = 43655
  let totalSpaceCount = 22524

  return {
    totalPostCount,
    totalSpaceCount,
  }
})

export default HomePage
