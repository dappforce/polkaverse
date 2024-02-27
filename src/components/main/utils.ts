import { DocumentNode } from '@apollo/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextRouter } from 'next/router'
import { DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import * as q from 'src/graphql/queries'
import { PostKind } from 'src/types/graphql-global-types'
import { filterByKey } from './HomePageFilters'
import {
  CreateQueryType,
  DateFilterType,
  EntityFilter,
  FilterType,
  PostFilterType,
  SpaceFilterType,
  TabsWithoutFeed,
} from './types'

import config from 'src/config'
import { createQueryFromSearchParams, getCurrentSearchParams } from 'src/utils/url'

const { enableGraphQl } = config

dayjs.extend(utc)

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss[Z]'

const getPostsByFilter: GetEntityFilter<PostFilterType> = {
  latest: {
    day: q.GET_LATEST_POST_IDS,
    week: q.GET_LATEST_POST_IDS,
    month: q.GET_LATEST_POST_IDS,
    allTime: q.GET_LATEST_POST_IDS,
  },
  suggested: {
    day: q.GET_LATEST_POST_IDS,
    week: q.GET_LATEST_POST_IDS,
    month: q.GET_LATEST_POST_IDS,
    allTime: q.GET_LATEST_POST_IDS,
  },
  hot: {
    day: q.GET_LATEST_POST_IDS,
    week: q.GET_LATEST_POST_IDS,
    month: q.GET_LATEST_POST_IDS,
    allTime: q.GET_LATEST_POST_IDS,
  },
  // removed most liked and commented
  // liked: {
  //   day: q.GET_MOST_LIKED_POST_IDS_IN_DATE_RANGE,
  //   week: q.GET_MOST_LIKED_POST_IDS_IN_DATE_RANGE,
  //   month: q.GET_MOST_LIKED_POST_IDS_IN_DATE_RANGE,
  //   allTime: q.GET_MOST_LIKED_POST_IDS,
  // },
  // commented: {
  //   day: q.GET_MOST_COMMENTED_POST_IDS_IN_DATE_RANGE,
  //   week: q.GET_MOST_COMMENTED_POST_IDS_IN_DATE_RANGE,
  //   month: q.GET_MOST_COMMENTED_POST_IDS_IN_DATE_RANGE,
  //   allTime: q.GET_MOST_COMMENTED_POST_IDS,
  // },
}

const getSpacesByFilter: GetEntityFilter<Exclude<SpaceFilterType, 'suggested'>> = {
  creators: {
    day: q.GET_LATEST_SPACE_IDS,
    week: q.GET_LATEST_SPACE_IDS,
    month: q.GET_LATEST_SPACE_IDS,
    allTime: q.GET_LATEST_SPACE_IDS,
  },
  // latest: {
  //   day: q.GET_LATEST_SPACE_IDS,
  //   week: q.GET_LATEST_SPACE_IDS,
  //   month: q.GET_LATEST_SPACE_IDS,
  //   allTime: q.GET_LATEST_SPACE_IDS,
  // },
  // sortByFollowers: {
  //   day: q.GET_MOST_FOLLOWED_SPACE_IDS_IN_DATE_RANGE,
  //   week: q.GET_MOST_FOLLOWED_SPACE_IDS_IN_DATE_RANGE,
  //   month: q.GET_MOST_FOLLOWED_SPACE_IDS_IN_DATE_RANGE,
  //   allTime: q.GET_MOST_FOLLOWED_SPACE_IDS,
  // },
  // sortByPosts: {
  //   day: q.GET_SPACE_IDS_SORTED_BY_POSTS_COUNT_IN_DATE_RANGE,
  //   week: q.GET_SPACE_IDS_SORTED_BY_POSTS_COUNT_IN_DATE_RANGE,
  //   month: q.GET_SPACE_IDS_SORTED_BY_POSTS_COUNT_IN_DATE_RANGE,
  //   allTime: q.GET_SPACE_IDS_SORTED_BY_POSTS_COUNT,
  // },
}

export const tabs = ['feed', 'posts', 'comments', 'spaces', 'creators']

type GetEntityFilter<Type extends EntityFilter> = Record<Type, Record<DateFilterType, DocumentNode>>

type VariablesType = {
  offset: number
  limit: number
  kinds?: PostKind[]
  startDate?: string
  endDate?: string
}

const createLoadEntitiesByQuery =
  <Type extends EntityFilter>(getEntityByFilter: GetEntityFilter<Type>) =>
  async ({ client, kind, offset, filter: { type, date = 'allTime' } }: CreateQueryType<Type>) => {
    const query = getEntityByFilter[type][date]

    if (!query) return []

    const kinds: PostKind[] = kind ? [kind] : []
    if (kind === PostKind.RegularPost) {
      kinds.push(PostKind.SharedPost)
    }
    const variables: VariablesType =
      date === 'allTime'
        ? { kinds, offset, limit: DEFAULT_PAGE_SIZE }
        : {
            kinds,
            offset,
            limit: DEFAULT_PAGE_SIZE,
            startDate: dateToUtcFormat().subtract(1, date).format(DATE_FORMAT),
            endDate: dateToUtcFormat().format(DATE_FORMAT),
          }

    const { data } = await client.query({ query, variables })

    return data
  }

export const loadSpacesByQuery = createLoadEntitiesByQuery(getSpacesByFilter)

export const loadPostsByQuery = createLoadEntitiesByQuery(getPostsByFilter)

export const getFilterType = (key: string, type: string | undefined): EntityFilter | undefined => {
  if (key === 'feed') return
  if (filterByKey[key as TabsWithoutFeed].length === 0) return undefined

  const typeIndex = filterByKey[key as TabsWithoutFeed].findIndex(
    typeFromObj => typeFromObj.value === type,
  )

  const filterType = typeIndex > 0 ? typeIndex : 0

  return filterByKey[key as TabsWithoutFeed][filterType].value as EntityFilter
}

export const setTabInUrl = (router: NextRouter, tab: string, queries?: Record<string, string>) => {
  const query = {
    tab,
    ...queries,
  }

  const current = getCurrentSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    current.set(key, value)
  })
  const updatedQuery = createQueryFromSearchParams(current)

  const newPath = {
    pathname: router.pathname,
    query: updatedQuery,
  }

  const queryStr = Object.entries(updatedQuery)
    .map(([key, value]) => !!value && `${key}=${value}`)
    .filter(Boolean)
    .join('&')
  const asPath = `${router.asPath.split('?')[0]}?${queryStr}`

  router.push(newPath, asPath)
}

export const setFiltersInUrl = (
  router: NextRouter,
  key: string,
  filterType?: FilterType<EntityFilter> | undefined,
  additionalQueries?: Record<string, string>,
) => setTabInUrl(router, key, { ...filterType, ...additionalQueries })

export const isSuggested = (filterType: EntityFilter) =>
  filterType === 'suggested' || !enableGraphQl

const dateToUtcFormat = () => dayjs().utc()
