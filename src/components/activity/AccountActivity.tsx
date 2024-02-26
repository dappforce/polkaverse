import { Tabs } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import config from 'src/config'
import { ActivityCounts } from 'src/graphql/apis'
import {
  useGetActivityCounts,
  useGetAllActivities,
  useGetCommentActivities,
  useGetFollowActivities,
  useGetPostActivities,
  useGetTweetActivities,
} from 'src/graphql/hooks'
import { useIsMyAddress } from '../auth/MyAccountsContext'
import WriteSomething from '../posts/WriteSomething'
import { Loading } from '../utils'
import { createLoadMorePosts, FeedActivities } from './FeedActivities'
import { createLoadMoreActivities, NotifActivities } from './Notifications'
import { OnchainAccountActivity } from './OnchainAccountActivity'
import { SpaceActivities } from './SpaceActivities'
import { BaseActivityProps } from './types'

const { TabPane } = Tabs

type ActivitiesByAddressProps = {
  address: string
  withWriteSomethingBlock?: boolean
}

const AllActivities = (props: BaseActivityProps) => {
  const getAllActivities = useGetAllActivities()
  const loadMoreActivities = createLoadMoreActivities(getAllActivities)
  return (
    <NotifActivities
      {...props}
      showMuted
      type='activities'
      loadMore={loadMoreActivities}
      noDataDesc='No activities yet'
      loadingLabel='Loading activities...'
    />
  )
}

// const ReactionActivities = (props: BaseActivityProps) => {
//   const getReactionActivities = useGetReactionActivities()
//   const loadMoreReactions = createLoadMoreActivities(getReactionActivities)
//   return (
//     <NotifActivities
//       {...props}
//       type='activities'
//       loadMore={loadMoreReactions}
//       noDataDesc='No reactions yet'
//       loadingLabel='Loading reactions...'
//     />
//   )
// }

const FollowActivities = (props: BaseActivityProps) => {
  const getFollowActivities = useGetFollowActivities()
  const loadMoreFollows = createLoadMoreActivities(getFollowActivities)
  return (
    <NotifActivities
      {...props}
      showMuted
      type='activities'
      loadMore={loadMoreFollows}
      noDataDesc='No follows yet'
      loadingLabel='Loading follows...'
    />
  )
}

const CommentActivities = (props: BaseActivityProps) => {
  const getCommentActivities = useGetCommentActivities()
  const loadMoreComments = createLoadMorePosts(getCommentActivities)
  return (
    <FeedActivities
      {...props}
      showMuted
      loadMore={loadMoreComments}
      noDataDesc='No comments yet'
      loadingLabel='Loading comments...'
    />
  )
}

const PostActivities = (props: BaseActivityProps) => {
  const getPostActivities = useGetPostActivities()
  const loadMorePosts = createLoadMorePosts(getPostActivities)
  return (
    <FeedActivities
      {...props}
      showMuted
      loadMore={loadMorePosts}
      noDataDesc='No posts yet'
      loadingLabel='Loading posts...'
    />
  )
}

const TweetActivities = (props: BaseActivityProps) => {
  const getTweetActivities = useGetTweetActivities()
  const loadMorePosts = createLoadMorePosts(getTweetActivities)
  return (
    <FeedActivities
      {...props}
      showMuted
      loadMore={loadMorePosts}
      noDataDesc='No tweets yet'
      loadingLabel='Loading tweets...'
    />
  )
}

const activityTabs = [
  'posts',
  'tweets',
  'comments',
  'reactions',
  'follows',
  'spaces',
  'all',
] as const
type ActivityTab = (typeof activityTabs)[number]
const getTab = (tab: ActivityTab) => tab
const OffchainAccountActivity = ({
  address,
  withWriteSomethingBlock = true,
}: ActivitiesByAddressProps) => {
  const isMyAddress = useIsMyAddress(address)
  const getActivityCounts = useGetActivityCounts()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ActivityTab>('posts')
  const [counts, setCounts] = useState<ActivityCounts>()
  // to make tweets tab doesn't disappear until the address is changed.
  const [haveDisplayedTweetsTab, setHaveDisplayedTweetsTab] = useState(false)

  useEffect(() => {
    setActiveTab('posts')
    setCounts(undefined)
    setHaveDisplayedTweetsTab(false)
    ;(async () => {
      if (!address) return

      const counts = await getActivityCounts({ address })
      setCounts(counts)
    })()
  }, [address])

  useEffect(() => {
    if (activeTab === 'tweets') setHaveDisplayedTweetsTab(true)
  }, [activeTab])

  useEffect(() => {
    const hash = window.location.hash.substring(1) as ActivityTab
    if (activityTabs.includes(hash)) {
      setActiveTab(hash)
    }
  }, [])

  if (!counts) return <Loading label='Loading activities...' />

  const {
    postsCount,
    commentsCount,
    // reactionsCount,
    followsCount,
    activitiesCount,
    spacesCount,
    tweetsCount,
  } = counts

  const getTabTitle = (title: string, count: number) => `${title} (${count})`

  const panePaddingClass = 'px-1 px-md-0'

  const onChangeTab = (activeKey: string) => {
    setActiveTab(activeKey as ActivityTab)
    router.replace('#' + activeKey)
  }

  return (
    <Tabs activeKey={activeTab} onChange={onChangeTab}>
      <TabPane tab={getTabTitle('Posts', postsCount)} key={getTab('posts')}>
        {isMyAddress ? (
          <div className='d-flex flex-column mt-3'>
            {withWriteSomethingBlock && <WriteSomething />}
            <PostActivities address={address} totalCount={postsCount} />
          </div>
        ) : (
          <PostActivities address={address} totalCount={postsCount} />
        )}
      </TabPane>
      {(tweetsCount > 0 || haveDisplayedTweetsTab) && (
        <TabPane tab={getTabTitle('Tweets', tweetsCount)} key={getTab('tweets')}>
          <TweetActivities address={address} totalCount={tweetsCount} />
        </TabPane>
      )}
      <TabPane tab={getTabTitle('Comments', commentsCount)} key={getTab('comments')}>
        <CommentActivities address={address} totalCount={commentsCount} />
      </TabPane>
      {/* <TabPane
        tab={getTabTitle('Reactions', reactionsCount)}
        key={getTab('reactions')}
        className={panePaddingClass}
      >
        <ReactionActivities address={address} totalCount={reactionsCount} />
      </TabPane> */}
      <TabPane
        tab={getTabTitle('Follows', followsCount)}
        key={getTab('follows')}
        className={panePaddingClass}
      >
        <FollowActivities address={address} totalCount={followsCount} />
      </TabPane>
      <TabPane tab={getTabTitle('Spaces', spacesCount)} key={getTab('spaces')}>
        <SpaceActivities address={address} totalCount={spacesCount} />
      </TabPane>
      <TabPane
        tab={getTabTitle('All', activitiesCount)}
        key={getTab('all')}
        className={panePaddingClass}
      >
        <AllActivities address={address} totalCount={activitiesCount} />
      </TabPane>
    </Tabs>
  )
}

export const AccountActivity = (props: ActivitiesByAddressProps) => {
  if (!config.enableActivity) return null

  const Activity = config.enableOnchainActivities ? OnchainAccountActivity : OffchainAccountActivity

  return <Activity {...props} />
}
