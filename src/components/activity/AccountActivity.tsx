import { PostWithSomeDetails, SpaceData } from '@subsocial/api/types'
import { Tabs } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import config from 'src/config'
import { ActivityCounts } from 'src/graphql/apis'
import {
  useGetActivityCounts,
  // useGetAllActivities,
  useGetCommentActivities,
  // useGetFollowActivities,
  useGetPostActivities,
} from 'src/graphql/hooks'
import { useFetchPosts, useSelectPost, useSelectSpace } from 'src/rtk/app/hooks'
import { useIsMyAddress } from '../auth/MyAccountsContext'
import WriteSomething from '../posts/WriteSomething'
// import { PostPreviewsOnSpace } from '../spaces/helpers'
import { Loading } from '../utils'
import { createLoadMorePosts, FeedActivities } from './FeedActivities'
// import { createLoadMoreActivities, NotifActivities } from './Notifications'
import ChatLinkButtonWithCounter from '../chat/ChatLinkButtonWithCounter'
import { OnchainAccountActivity } from './OnchainAccountActivity'
import { SpaceActivities } from './SpaceActivities'
import styles from './style.module.sass'
import { BaseActivityProps } from './types'

const { TabPane } = Tabs

type WithSpacePosts = {
  spaceData: SpaceData
  postIds: string[]
  posts: PostWithSomeDetails[]
}
type ActivitiesByAddressProps = {
  address: string
  withSpacePosts?: WithSpacePosts
  withWriteSomethingBlock?: boolean
  spaceId?: string
}

// const AllActivities = (props: BaseActivityProps) => {
//   const getAllActivities = useGetAllActivities()
//   const loadMoreActivities = createLoadMoreActivities(getAllActivities)
//   return (
//     <NotifActivities
//       {...props}
//       showMuted
//       type='activities'
//       loadMore={loadMoreActivities}
//       noDataDesc='No activities yet'
//       loadingLabel='Loading activities...'
//     />
//   )
// }

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

// const FollowActivities = (props: BaseActivityProps) => {
//   const getFollowActivities = useGetFollowActivities()
//   const loadMoreFollows = createLoadMoreActivities(getFollowActivities)
//   return (
//     <NotifActivities
//       {...props}
//       showMuted
//       type='activities'
//       loadMore={loadMoreFollows}
//       noDataDesc='No follows yet'
//       loadingLabel='Loading follows...'
//     />
//   )
// }

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

// const SpacePostsContent = (props: WithSpacePosts) => {
//   return <PostPreviewsOnSpace {...props} />
// }

// const TweetActivities = (props: BaseActivityProps) => {
//   const getTweetActivities = useGetTweetActivities()
//   const loadMorePosts = createLoadMorePosts(getTweetActivities)
//   return (
//     <FeedActivities
//       {...props}
//       showMuted
//       loadMore={loadMorePosts}
//       noDataDesc='No tweets yet'
//       loadingLabel='Loading tweets...'
//     />
//   )
// }

const activityTabs = [
  'space-posts',
  'posts',
  'tweets',
  'comments',
  'reactions',
  'follows',
  'spaces',
  'all',
  'chat',
] as const

type ActivityTab = (typeof activityTabs)[number]

const getTab = (tab: ActivityTab) => tab

const OffchainAccountActivity = ({
  address,
  withWriteSomethingBlock = true,
  spaceId,
}: ActivitiesByAddressProps) => {
  const initialActiveTab = 'posts'

  const isMyAddress = useIsMyAddress(address)
  const getActivityCounts = useGetActivityCounts()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ActivityTab>(initialActiveTab)
  const [counts, setCounts] = useState<ActivityCounts>()

  const space = useSelectSpace(spaceId)

  const chatId = (space?.content?.chats as any[])?.[0]?.id as string | undefined

  useFetchPosts(chatId ? [chatId] : [])

  const post = useSelectPost(chatId)

  // to make tweets tab doesn't disappear until the address is changed.

  useEffect(() => {
    setActiveTab(initialActiveTab)
    setCounts(undefined)
    ;(async () => {
      if (!address) return

      const counts = await getActivityCounts({ address })
      setCounts(counts)
    })()
  }, [address])

  useEffect(() => {
    const hash = window.location.hash.substring(1) as ActivityTab
    if (activityTabs.includes(hash)) {
      setActiveTab(hash)
    }
  }, [])

  if (!counts) return <Loading label='Loading activities...' />

  const { postsCount, commentsCount, spacesCount } = counts

  const getTabTitle = (title: string, count: number) => `${title} (${count})`

  const onChangeTab = (activeKey: string) => {
    setActiveTab(activeKey as ActivityTab)
    router.replace('#' + activeKey)
  }

  return (
    <Tabs
      activeKey={activeTab}
      onChange={onChangeTab}
      renderTabBar={(props, DefaultTabBar) => {
        return (
          <div className={styles.TabsBlock}>
            {chatId && post && !post.post.struct.hidden && (
              <ChatLinkButtonWithCounter post={post.post} />
            )}
            <DefaultTabBar {...props} />
          </div>
        )
      }}
    >
      <TabPane tab={getTabTitle('Posts', postsCount)} key={getTab('posts')}>
        {isMyAddress ? (
          <div className={clsx('d-flex flex-column', withWriteSomethingBlock && 'mt-3')}>
            {withWriteSomethingBlock && <WriteSomething />}
            <PostActivities address={address} totalCount={postsCount} />
          </div>
        ) : (
          <PostActivities address={address} totalCount={postsCount} />
        )}
      </TabPane>
      <TabPane tab={getTabTitle('Comments', commentsCount)} key={getTab('comments')}>
        <CommentActivities address={address} totalCount={commentsCount} />
      </TabPane>
      <TabPane tab={getTabTitle('Spaces', spacesCount)} key={getTab('spaces')}>
        <SpaceActivities address={address} totalCount={spacesCount} />
      </TabPane>
    </Tabs>
  )
}

export const AccountActivity = (props: ActivitiesByAddressProps) => {
  if (!config.enableActivity) return null

  const Activity = config.enableOnchainActivities ? OnchainAccountActivity : OffchainAccountActivity

  return <Activity {...props} />
}
