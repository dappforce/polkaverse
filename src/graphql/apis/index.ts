import { Counts } from '@subsocial/api/types'
import dayjs from 'dayjs'
import { ActivityEvent, StatType } from 'src/components/statistics/Statistics'
import { Activity, ReactionStruct } from 'src/types'
import { EventName } from 'src/types/graphql-global-types'
import { getDateWithOffset } from 'src/utils/date'
import { GqlClient } from '../ApolloProvider'
import * as q from '../queries'
import { GetActivityCountStat, getActivityCountStatQuery } from '../queryGenerator'
import { GetActivityCounts, GetActivityCountsVariables } from '../__generated__/GetActivityCounts'
import {
  GetAddressPostsReaction,
  GetAddressPostsReactionVariables,
} from '../__generated__/GetAddressPostsReaction'
import { GetAllActivity, GetAllActivityVariables } from '../__generated__/GetAllActivity'
import {
  GetCommentActivities,
  GetCommentActivitiesVariables,
} from '../__generated__/GetCommentActivities'
import {
  GetFollowActivities,
  GetFollowActivitiesVariables,
} from '../__generated__/GetFollowActivities'
import {
  GetFollowingSpaces,
  GetFollowingSpacesVariables,
} from '../__generated__/GetFollowingSpaces'
import { GetLatestPostId } from '../__generated__/GetLatestPostId'
import { GetLatestSpaceId } from '../__generated__/GetLatestSpaceId'
import { GetNewsFeeds, GetNewsFeedsVariables } from '../__generated__/GetNewsFeeds'
import { GetNewsFeedsCount, GetNewsFeedsCountVariables } from '../__generated__/GetNewsFeedsCount'
import { GetNotifications, GetNotificationsVariables } from '../__generated__/GetNotifications'
import {
  GetNotificationsCount,
  GetNotificationsCountVariables,
} from '../__generated__/GetNotificationsCount'
import { GetPostActivities, GetPostActivitiesVariables } from '../__generated__/GetPostActivities'
import {
  GetPostIdsBySpaces,
  GetPostIdsBySpacesVariables,
} from '../__generated__/GetPostIdsBySpaces'
import { GetPostsData, GetPostsDataVariables } from '../__generated__/GetPostsData'
import { GetProfilesCount } from '../__generated__/GetProfilesCount'
import { GetProfilesData, GetProfilesDataVariables } from '../__generated__/GetProfilesData'
import {
  GetReactionActivities,
  GetReactionActivitiesVariables,
} from '../__generated__/GetReactionActivities'
import { GetSearchResults, GetSearchResultsVariables } from '../__generated__/GetSearchResults'
import {
  GetSpaceActivities,
  GetSpaceActivitiesVariables,
} from '../__generated__/GetSpaceActivities'
import { GetSpacesData, GetSpacesDataVariables } from '../__generated__/GetSpacesData'
import {
  mapActivityQueryResult,
  mapCommentEventNames,
  mapPostFragmentWithParent,
  mapProfileFragment,
  mapSpaceFragment,
} from './mappers'
import { PostFragmentWithParent, ProfileFragmentMapped, SpaceFragmentMapped } from './types'

export async function getNewsFeedsCount(client: GqlClient, variables: GetNewsFeedsCountVariables) {
  const res = await client.query<GetNewsFeedsCount, GetNewsFeedsCountVariables>({
    query: q.GET_NEWS_FEEDS_COUNT,
    variables,
  })
  return res.data.newsFeedsConnection.totalCount ?? 0
}

export async function getNewsFeeds(client: GqlClient, variables: GetNewsFeedsVariables) {
  const feedIds = await client.query<GetNewsFeeds, GetNewsFeedsVariables>({
    query: q.GET_NEWS_FEEDS,
    variables,
  })

  const postIds = new Set<string>()
  feedIds.data.accountById?.feeds.forEach(({ activity }) => {
    const postId = activity.post?.id
    if (postId) {
      postIds.add(postId)
    }
  })
  return Array.from(postIds)
}

export async function getPostIdsBySpaces(
  client: GqlClient,
  variables: GetPostIdsBySpacesVariables,
) {
  const res = await client.query<GetPostIdsBySpaces, GetPostIdsBySpacesVariables>({
    query: q.GET_POST_IDS_BY_SPACES,
    variables,
  })
  return res.data.posts.map(({ id }) => id)
}

export type ActivityCounts = Counts & { tweetsCount: number }
export async function getActivityCounts(
  client: GqlClient,
  variables: GetActivityCountsVariables,
): Promise<ActivityCounts> {
  const res = await client.query<GetActivityCounts, GetActivityCountsVariables>({
    query: q.GET_ACTIVITY_COUNTS,
    variables,
  })

  const { activities, comments, follows, posts, reactions, spaces, tweets } = res.data
  return {
    activitiesCount: activities.totalCount,
    commentsCount: comments.totalCount,
    followsCount: follows.totalCount,
    postsCount: posts.totalCount,
    tweetsCount: tweets.totalCount,
    reactionsCount: reactions.totalCount,
    spacesCount: spaces.totalCount,
  }
}

export async function getAllActivities(client: GqlClient, variables: GetAllActivityVariables) {
  const activities = await client.query<GetAllActivity, GetAllActivityVariables>({
    query: q.GET_ALL_ACTIVITY,
    variables,
  })
  return (
    activities.data.accountById?.activities.map<Activity>(activity => {
      const isComment = activity.post?.isComment
      return mapActivityQueryResult(activity, {
        followingId: activity.followingAccount?.id,
        spaceId: activity.space?.id,
        postId: !isComment ? activity.post?.id : undefined,
        commentId: isComment ? activity.post?.id : undefined,
        event: mapCommentEventNames(activity.event, isComment),
        reactionKind: activity.reaction?.kind,
      })
    }) ?? []
  )
}

export async function getFollowActivities(
  client: GqlClient,
  variables: GetFollowActivitiesVariables,
) {
  const activities = await client.query<GetFollowActivities, GetFollowActivitiesVariables>({
    query: q.GET_FOLLOW_ACTIVITIES,
    variables,
  })
  return (
    activities.data.accountById?.activities.map<Activity>(activity => {
      return mapActivityQueryResult(activity, {
        followingId: activity.followingAccount?.id,
        spaceId: activity.space?.id,
      })
    }) ?? []
  )
}

export async function getReactionActivities(
  client: GqlClient,
  variables: GetReactionActivitiesVariables,
) {
  const activities = await client.query<GetReactionActivities, GetReactionActivitiesVariables>({
    query: q.GET_REACTION_ACTIVITIES,
    variables,
  })
  return (
    activities.data.accountById?.activities.map<Activity>(activity => {
      const isComment = activity.post?.isComment
      return mapActivityQueryResult(activity, {
        postId: !isComment ? activity.post?.id : undefined,
        commentId: isComment ? activity.post?.id : undefined,
        reactionKind: activity.reaction?.kind,
      })
    }) ?? []
  )
}

export async function getSpaceActivities(
  client: GqlClient,
  variables: GetSpaceActivitiesVariables,
) {
  const activities = await client.query<GetSpaceActivities, GetSpaceActivitiesVariables>({
    query: q.GET_SPACE_ACTIVITIES,
    variables,
  })
  const spaceIds: string[] = []
  activities.data.accountById?.spacesOwned.forEach(space => {
    const spaceId = space?.id
    if (spaceId) {
      spaceIds.push(spaceId)
    }
  })
  return spaceIds
}

export async function getPostActivities(client: GqlClient, variables: GetPostActivitiesVariables) {
  const activities = await client.query<GetPostActivities, GetPostActivitiesVariables>({
    query: q.GET_POST_ACTIVITIES,
    variables,
  })
  const postIds: string[] = []
  activities.data.accountById?.posts.forEach(post => {
    const postId = post?.id
    if (postId) {
      postIds.push(postId)
    }
  })
  return postIds
}

export async function getTweetActivities(client: GqlClient, variables: GetPostActivitiesVariables) {
  const activities = await client.query<GetPostActivities, GetPostActivitiesVariables>({
    query: q.GET_TWEET_ACTIVITIES,
    variables,
  })
  const postIds: string[] = []
  activities.data.accountById?.posts.forEach(post => {
    const postId = post?.id
    if (postId) {
      postIds.push(postId)
    }
  })
  return postIds
}

export async function getCommentActivities(
  client: GqlClient,
  variables: GetCommentActivitiesVariables,
) {
  const activities = await client.query<GetCommentActivities, GetCommentActivitiesVariables>({
    query: q.GET_COMMENT_ACTIVITIES,
    variables,
  })
  const commentIds: string[] = []
  activities.data.accountById?.posts.forEach(post => {
    const commentId = post?.id
    if (commentId) {
      commentIds.push(commentId)
    }
  })
  return commentIds
}

export async function getNotificationCount(
  client: GqlClient,
  variables: GetNotificationsCountVariables,
) {
  const count = await client.query<GetNotificationsCount, GetNotificationsCountVariables>({
    query: q.GET_NOTIFICATIONS_COUNT,
    variables,
  })
  return count.data.notificationsConnection.totalCount
}

export async function getAllNotifications(client: GqlClient, variables: GetNotificationsVariables) {
  const notifications = await client.query<GetNotifications, GetNotificationsVariables>({
    query: q.GET_NOTIFICATIONS,
    variables,
  })
  return (
    notifications.data?.notifications.map(({ activity }) => {
      const isComment = activity.post?.isComment
      return mapActivityQueryResult(activity, {
        followingId: activity.followingAccount?.id,
        spaceId: activity.space?.id,
        postId: !isComment ? activity.post?.id : undefined,
        commentId: isComment ? activity.post?.id : undefined,
        event: mapCommentEventNames(activity.event, isComment),
        reactionKind: activity.reaction?.kind,
      })
    }) ?? []
  )
}

export async function getPostsData(client: GqlClient, variables: GetPostsDataVariables) {
  const posts = await client.query<GetPostsData, GetPostsDataVariables>({
    query: q.GET_POSTS_DATA,
    variables,
  })
  return posts.data.posts.map<PostFragmentWithParent>(post => mapPostFragmentWithParent(post))
}

export async function getSpacesData(client: GqlClient, variables: GetSpacesDataVariables) {
  const spaces = await client.query<GetSpacesData, GetSpacesDataVariables>({
    query: q.GET_SPACES_DATA,
    variables,
  })
  return spaces.data.spaces.map<SpaceFragmentMapped>(space => mapSpaceFragment(space))
}

export async function getProfilesData(client: GqlClient, variables: GetProfilesDataVariables) {
  const res = await client.query<GetProfilesData, GetProfilesDataVariables>({
    query: q.GET_PROFILES_DATA,
    variables,
  })
  const profiles = res.data.accounts
  return profiles.map<ProfileFragmentMapped>(profile => mapProfileFragment(profile))
}

export async function getAddressPostsReaction(
  client: GqlClient,
  variables: GetAddressPostsReactionVariables,
  idSeparator = '-',
) {
  const res = await client.query<GetAddressPostsReaction, GetAddressPostsReactionVariables>({
    query: q.GET_ADDRESS_POSTS_REACTION,
    variables,
  })
  const reactions = res.data.reactions

  return reactions.map<ReactionStruct>(({ id, kind, post }) => ({
    reactionId: id,
    kind,
    id: `${variables.address}${idSeparator}${post.id}`,
  }))
}

export async function getActivityCountStat(
  client: GqlClient,
  { event, period }: { period: number; event: ActivityEvent },
): Promise<StatType> {
  const eventFilters = event.split(',') as EventName[]
  const res = await client.query<GetActivityCountStat>({
    query: getActivityCountStatQuery(period, eventFilters),
  })
  const statisticsData = Array.from({ length: period }).reduce<StatType['statisticsData']>(
    (acc, _, index) => {
      const offset = period - index
      const dateAfterOffset = getDateWithOffset(offset)
      let count = res.data?.[`offset${offset}`]?.totalCount
      const formatDate = dayjs.utc(dateAfterOffset).format('YYYY-MM-DD')
      if (count !== undefined) {
        acc.push({
          count,
          format_date: formatDate,
        })
      }
      return acc
    },
    [],
  )

  return {
    activityType: event,
    countByPeriod: res.data.period.totalCount,
    totalCount: res.data.total.totalCount,
    todayCount: res.data.today.totalCount,
    statisticsData,
  }
}

export async function getLatestSpaceId(client: GqlClient) {
  const res = await client.query<GetLatestSpaceId>({
    query: q.GET_LATEST_SPACE_ID,
  })
  const [latestSpace] = res.data.spaces
  return latestSpace?.id
}

export async function getLatestPostId(client: GqlClient) {
  const res = await client.query<GetLatestPostId>({
    query: q.GET_LATEST_POST_ID,
  })
  const [latestPost] = res.data.posts
  return latestPost?.id
}

export async function getProfileSpaceCount(client: GqlClient) {
  const res = await client.query<GetProfilesCount>({
    query: q.GET_PROFILES_COUNT,
  })
  return res.data.accountsConnection.totalCount
}

export async function getFollowingSpaces(
  client: GqlClient,
  variables: GetFollowingSpacesVariables,
) {
  const res = await client.query<GetFollowingSpaces, GetFollowingSpacesVariables>({
    query: q.GET_FOLLOWING_SPACES,
    variables,
  })
  return res.data.accountById?.spacesFollowed.map(space => space.followingSpace.id)
}

export async function searchResults(client: GqlClient, variables: GetSearchResultsVariables) {
  const res = await client.query<GetSearchResults, GetSearchResultsVariables>({
    query: q.GET_SEARCH_RESULTS,
    variables,
  })

  const { hits } = res.data.searchQuery

  return hits
}

export async function getLastestPostIdsInSpace(
  client: GqlClient,
  variables: { spaceId: string; limit: number },
) {
  const res = await client.query<{ posts: { id: string }[] }, { spaceId: string }>({
    query: q.GET_LASTEST_POST_IDS_IN_SPACE,
    variables,
  })

  const posts = res.data.posts ?? []
  return posts.map(post => post.id)
}
