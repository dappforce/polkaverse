import { useApolloClient } from '@apollo/client'
import { PostWithSomeDetails, SpaceData, SpaceStruct } from '@subsocial/api/types'
import { Tabs } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import config from 'src/config'
import { ActivityCounts } from 'src/graphql/apis'
import { useGetActivityCounts, useGetCommentActivities } from 'src/graphql/hooks'
import { useFetchPosts, useSelectPost, useSelectSpace } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchProfilePosts } from 'src/rtk/features/posts/postsSlice'
import { useIsMyAddress } from '../auth/MyAccountsContext'
import ChatLinkButtonWithCounter from '../chat/ChatLinkButtonWithCounter'
import { InfinitePageList, InnerLoadMoreFn } from '../lists'
import { PublicPostPreviewById } from '../posts/PublicPostPreview'
import WriteSomething from '../posts/WriteSomething'
import { useIsMySpace } from '../spaces/helpers'
import { CreatePostButton } from '../spaces/helpers/CreatePostButton'
import { FollowerCanPostAlert } from '../spaces/permissions/FollowerCanPostAlert'
import { useSubsocialApi } from '../substrate'
import { Loading } from '../utils'
import { createLoadMorePosts, FeedActivities } from './FeedActivities'
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
  postsCount?: number
  withWriteSomethingBlock?: boolean
  spaceId?: string
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

type ProfileSpacePostsProps = {
  address: string
  postIds?: string[]
  space?: SpaceStruct
  profilePostsCount?: number
}

const ProfileSpacePosts = ({
  address,
  postIds,
  space,
  profilePostsCount,
}: ProfileSpacePostsProps) => {
  const dispatch = useAppDispatch()
  const { subsocial, isApiReady } = useSubsocialApi()
  const client = useApolloClient()

  const loadMore: InnerLoadMoreFn = async (page, size) => {
    if (!isApiReady) return []

    const offset = (page - 1) * size
    const result = await dispatch(
      fetchProfilePosts({
        api: subsocial,
        id: address,
        spaceId: space?.id,
        client: client as any,
        limit: size,
        offset,
        dispatch,
      }),
    )
    const posts = result.payload as PostWithSomeDetails[]

    return posts.map(p => p.id)
  }

  const List = useCallback(
    () => (
      <InfinitePageList
        loadingLabel='Loading more posts...'
        initialPage={postIds ? 1 : 0}
        dataSource={postIds}
        loadMore={loadMore}
        totalCount={profilePostsCount || 0}
        noDataDesc='No posts yet'
        noDataExt={space && <CreatePostButton space={space} />}
        getKey={postId => postId}
        renderItem={postId => <PublicPostPreviewById postId={postId} />}
        beforeList={space && <FollowerCanPostAlert space={space} />}
      />
    ),
    [isApiReady],
  )

  return <List />
}

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
  withSpacePosts,
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

  const isMySpace = useIsMySpace(space?.struct)

  // to make tweets tab doesn't disappear until the address is changed.

  useEffect(() => {
    setActiveTab(initialActiveTab)
    setCounts(undefined)
    ;(async () => {
      if (!address) return

      const counts = await getActivityCounts({
        address,
        withHidden: isMySpace || isMyAddress,
        spaceId,
      })
      setCounts(counts)
    })()
  }, [address, isMySpace, isMyAddress])

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

  const postsView = (
    <ProfileSpacePosts
      postIds={withSpacePosts?.postIds}
      profilePostsCount={postsCount}
      space={space?.struct}
      address={address}
    />
  )

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
            {postsView}
          </div>
        ) : (
          postsView
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
