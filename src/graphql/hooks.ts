// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useCallback } from 'react'
import {
  getActivityCounts,
  getActivityCountStat,
  getAllActivities,
  getAllNotifications,
  getCommentActivities,
  getFollowActivities,
  getNewsFeeds,
  getNewsFeedsCount,
  getNotificationCount,
  getPostActivities,
  getReactionActivities,
  getSpaceActivities,
  getTweetActivities,
} from './apis'
import { GqlClient, useDfApolloClient } from './ApolloProvider'

export function createGqlHooks<Variables, ReturnType>(
  workerFunc: (client: GqlClient, variables: Variables) => Promise<ReturnType>,
  defaultData: ReturnType,
) {
  return function () {
    const client = useDfApolloClient()
    return useCallback(
      async (variables: Variables) => {
        if (!client) return defaultData
        return workerFunc(client, variables)
      },
      [client],
    )
  }
}

export const useGetNewsFeedsCount = createGqlHooks(getNewsFeedsCount, 0)
export const useGetNewsFeeds = createGqlHooks(getNewsFeeds, [])
export const useGetActivityCounts = createGqlHooks(getActivityCounts, {
  activitiesCount: 0,
  commentsCount: 0,
  followsCount: 0,
  postsCount: 0,
  reactionsCount: 0,
  spacesCount: 0,
  tweetsCount: 0,
})
export const useGetAllActivities = createGqlHooks(getAllActivities, [])
export const useGetFollowActivities = createGqlHooks(getFollowActivities, [])
export const useGetReactionActivities = createGqlHooks(getReactionActivities, [])
export const useGetSpaceActivities = createGqlHooks(getSpaceActivities, [])
export const useGetPostActivities = createGqlHooks(getPostActivities, [])
export const useGetTweetActivities = createGqlHooks(getTweetActivities, [])
export const useGetCommentActivities = createGqlHooks(getCommentActivities, [])

export const useGetNotificationsCount = createGqlHooks(getNotificationCount, 0)
export const useGetAllNotifications = createGqlHooks(getAllNotifications, [])

export const useGetActivityCountStat = createGqlHooks(getActivityCountStat, {
  activityType: 'AccountFollowed',
  countByPeriod: 0,
  statisticsData: [],
  todayCount: 0,
  totalCount: 0,
})
