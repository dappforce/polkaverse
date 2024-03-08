import { nonEmptyStr } from '@subsocial/utils'
import { useEffect } from 'react'
import { DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import { useGetAllNotifications, useGetNotificationsCount } from 'src/graphql/hooks'
import { fetchPosts } from 'src/rtk/features/posts/postsSlice'
import { fetchProfileSpaces } from 'src/rtk/features/profiles/profilesSlice'
import { fetchSpaces } from 'src/rtk/features/spaces/spacesSlice'
import { AccountId, Activity, DataSourceTypes, PostId, SpaceId } from 'src/types'
import { InnerActivities } from './InnerActivities'
import { useNotifCounterContext } from './NotifCounter'
import { Notification } from './Notification'
import { ActivityProps, BaseActivityProps, LoadMoreFn, LoadMoreProps } from './types'

export type NotifActivitiesType = 'notifications' | 'activities'

type NotifActivitiesProps = ActivityProps<Activity> & {
  type: NotifActivitiesType
  showMuted?: boolean
}

export const NotifActivities = ({ loadMore, type, showMuted, ...props }: NotifActivitiesProps) => {
  return (
    <InnerActivities
      {...props}
      getKey={({ blockNumber, eventIndex }) => `${blockNumber}-${eventIndex}`}
      renderItem={activity => <Notification type={type} showMuted={showMuted} {...activity} />}
      loadMore={loadMore}
    />
  )
}

export const createLoadMoreActivities =
  (getActivity: LoadMoreFn<Activity>) => async (props: LoadMoreProps) => {
    const { address, page, size, subsocial: api, dispatch } = props

    if (!address) return []

    const offset = (page - 1) * size

    const activities = (await getActivity({ address, offset, limit: DEFAULT_PAGE_SIZE })) || []

    const ownerIds: AccountId[] = []
    const spaceIds: SpaceId[] = []
    const postIds: PostId[] = []

    activities.forEach(({ account, followingId, spaceId, postId, commentId }) => {
      nonEmptyStr(account) && ownerIds.push(account)
      nonEmptyStr(followingId) && ownerIds.push(followingId)
      nonEmptyStr(spaceId) && spaceIds.push(spaceId)
      nonEmptyStr(postId) && postIds.push(postId)
      nonEmptyStr(commentId) && postIds.push(commentId)
    })

    const fetches: Promise<any>[] = [
      dispatch(fetchSpaces({ ids: spaceIds, api, dataSource: DataSourceTypes.SQUID })),
      dispatch(fetchProfileSpaces({ ids: ownerIds, api, dataSource: DataSourceTypes.SQUID })),
      dispatch(
        fetchPosts({ ids: postIds, api, dataSource: DataSourceTypes.SQUID, withRootPost: true }),
      ),
    ]

    await Promise.all(fetches)

    return activities
  }

type LoadNotificationsFn = (props: LoadMoreProps) => Promise<Activity[]>

type LoadMoreNotifications = LoadMoreProps
const createLoadMoreNotifications =
  (getNotifs: LoadNotificationsFn) => async (props: LoadMoreNotifications) => {
    const { address } = props
    if (!address) return []

    const notifications = await getNotifs(props)

    return notifications
  }

export const Notifications = ({ address, title }: BaseActivityProps) => {
  const getNotificationsCount = useGetNotificationsCount()
  const { updateLastReadNotification } = useNotifCounterContext()

  useEffect(() => {
    updateLastReadNotification(new Date().toISOString())
  }, [])

  const getAllNotifications = useGetAllNotifications()
  const loadMoreActivities = createLoadMoreActivities(getAllNotifications)
  const loadMoreNotifications = createLoadMoreNotifications(loadMoreActivities)
  const loadMore = (props: LoadMoreProps) => loadMoreNotifications(props)

  return (
    <NotifActivities
      type='notifications'
      loadMore={loadMore}
      address={address}
      title={title}
      loadingLabel='Loading your notifications...'
      noDataDesc='No notifications for you'
      getCount={getNotificationsCount}
    />
  )
}
