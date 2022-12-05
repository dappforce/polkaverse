import { Tabs } from 'antd'
import { useEffect, useState } from 'react'
import config from 'src/config'
import {
  useGetActivityCounts,
  useGetAllActivities,
  useGetCommentActivities,
  useGetFollowActivities,
  useGetPostActivities,
  useGetReactionActivities,
} from 'src/graphql/hooks'
import { Counts } from 'src/types'
import { Loading } from '../utils'
import { createLoadMorePosts, FeedActivities } from './FeedActivities'
import { createLoadMoreActivities, NotifActivities } from './Notifications'
import { OnchainAccountActivity } from './OnchainAccountActivity'
import { SpaceActivities } from './SpaceActivities'
import { BaseActivityProps } from './types'

const { TabPane } = Tabs

type ActivitiesByAddressProps = {
  address: string
}

const AllActivities = (props: BaseActivityProps) => {
  const getAllActivities = useGetAllActivities()
  const loadMoreActivities = createLoadMoreActivities(getAllActivities)
  return (
    <NotifActivities
      {...props}
      type='activities'
      loadMore={loadMoreActivities}
      noDataDesc='No activities yet'
      loadingLabel='Loading activities...'
    />
  )
}

const ReactionActivities = (props: BaseActivityProps) => {
  const getReactionActivities = useGetReactionActivities()
  const loadMoreReactions = createLoadMoreActivities(getReactionActivities)
  return (
    <NotifActivities
      {...props}
      type='activities'
      loadMore={loadMoreReactions}
      noDataDesc='No reactions yet'
      loadingLabel='Loading reactions...'
    />
  )
}

const FollowActivities = (props: BaseActivityProps) => {
  const getFollowActivities = useGetFollowActivities()
  const loadMoreFollows = createLoadMoreActivities(getFollowActivities)
  return (
    <NotifActivities
      {...props}
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
      loadMore={loadMorePosts}
      noDataDesc='No posts yet'
      loadingLabel='Loading posts...'
    />
  )
}
const OffchainAccountActivity = ({ address }: ActivitiesByAddressProps) => {
  const getActivityCounts = useGetActivityCounts()
  const [counts, setCounts] = useState<Counts>()

  useEffect(() => {
    ;(async () => {
      if (!address) return

      const counts = await getActivityCounts({ address })
      setCounts(counts)
    })()
  }, [address])

  if (!counts) return <Loading label='Loading activities...' />

  const { postsCount, commentsCount, reactionsCount, followsCount, activitiesCount, spacesCount } =
    counts

  const getTabTitle = (title: string, count: number) => `${title} (${count})`

  const panePaddingClass = 'px-1 px-md-0'

  return (
    <Tabs>
      <TabPane tab={getTabTitle('Posts', postsCount)} key='posts'>
        <PostActivities address={address} totalCount={postsCount} />
      </TabPane>
      <TabPane tab={getTabTitle('Comments', commentsCount)} key='comments'>
        <CommentActivities address={address} totalCount={commentsCount} />
      </TabPane>
      <TabPane
        tab={getTabTitle('Reactions', reactionsCount)}
        key='reactions'
        className={panePaddingClass}
      >
        <ReactionActivities address={address} totalCount={reactionsCount} />
      </TabPane>
      <TabPane
        tab={getTabTitle('Follows', followsCount)}
        key='follows'
        className={panePaddingClass}
      >
        <FollowActivities address={address} totalCount={followsCount} />
      </TabPane>
      <TabPane tab={getTabTitle('Spaces', spacesCount)} key='spaces'>
        <SpaceActivities address={address} totalCount={spacesCount} />
      </TabPane>
      <TabPane tab={getTabTitle('All', activitiesCount)} key='all' className={panePaddingClass}>
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
