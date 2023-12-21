import { UpOutlined } from '@ant-design/icons'
import { Affix, BackTop, Button, Tabs, Tooltip } from 'antd'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import config from 'src/config'
import { GET_TOTAL_COUNTS } from 'src/graphql/queries'
import { GetHomePageData } from 'src/graphql/__generated__/GetHomePageData'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import { PostKind } from 'src/types/graphql-global-types'
import { useIsSignedIn } from '../auth/MyAccountsContext'
import { CreatorDashboardHomeVariant } from '../creators/CreatorDashboardSidebar'
import GetSubBanner from '../utils/banners/GetSubBanner'
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
        <TabPane tab={enableGraphQl ? 'Posts' : 'Polkadot News'} key='posts' />
        <TabPane tab={enableGraphQl ? 'Spaces' : 'Polkadot Spaces'} key='spaces' />
      </Tabs>
      <Filters tabKey={tabKey} isAffix={isAffix} />
    </>
  )
}

const AffixTabs = (props: AffixTabsProps) => {
  const { visible = false } = props

  return (
    <Affix offsetTop={64} className={`h-0 ${visible ? 'visible' : 'invisible'}`}>
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
  const isSignedIn = useIsSignedIn()
  const router = useRouter()
  let prevScrollpos = 0

  const [hidden, setHidden] = useState(false)

  const getFiltersFromUrl = () => {
    const {
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

  useEffect(() => {
    let variant: CreatorDashboardHomeVariant = 'posts'
    if (tab === 'spaces') variant = 'spaces'
    setCurrentTabVariant(variant)
  }, [setCurrentTabVariant, tab])

  const onChangeKey = (key: string) => {
    const typeValue = getFilterType(key, type)
    const filterType =
      key !== 'feed' ? ({ type: typeValue, date } as FilterType<EntityFilter>) : undefined

    setFiltersInUrl(router, key, filterType)
  }

  useEffect(() => onChangeKey(tab), [isSignedIn])

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
        <PostFilterView
          kind={PostKind.RegularPost}
          filter={{ type: type as PostFilterType, date }}
          {...props}
        />
      )
    } else {
      return <SpaceFilterView filter={{ type: type as SpaceFilterType, date }} {...props} />
    }
  }, [tab, type, date])

  return (
    <>
      <span>
        <AffixTabs tabKey={tab} setKey={onChangeKey} visible={hidden} {...props} />
      </span>
      <Section className='m-0'>
        <HomeTabs tabKey={tab} className='DfHomeTab' setKey={onChangeKey} {...props} />
        <TabsContent />
        <Tooltip title={'Back to top'} placement={'right'}>
          <BackTop className={style.DfBackToTop}>
            <Button size={'large'} icon={ToTopIcon} />
          </BackTop>
        </Tooltip>
      </Section>
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
        <GetSubBanner />
        <TabsHomePage {...props} setCurrentTabVariant={setCurrentTabVariant} />
      </PageContent>
    </>
  )
}

getInitialPropsWithRedux(HomePage, async ({ apolloClient }) => {
  const apolloRes = await apolloClient?.query<GetHomePageData>({
    query: GET_TOTAL_COUNTS,
  })

  let totalPostCount = 0
  let totalSpaceCount = 0

  if (apolloRes) {
    const {
      data: { postCount, spaceCount },
    } = apolloRes
    totalPostCount = postCount.totalCount
    totalSpaceCount = spaceCount.totalCount
  }

  return {
    totalPostCount,
    totalSpaceCount,
  }
})

export default HomePage
