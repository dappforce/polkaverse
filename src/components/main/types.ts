import { ApolloClient } from '@apollo/client'
import { SubsocialApi } from '@subsocial/api'
import { Dispatch } from 'react'
import { AccountId } from 'src/types'
import { PostKind } from '../../types/graphql-global-types'

export type PostFilterType = 'latest' | 'suggested'
// | 'liked' | 'commented' // removed most liked and commented

export type SpaceFilterType = 'suggested' | 'creators'
// 'latest' |  'sortByPosts' | 'sortByFollowers'

export type DateFilterType = 'day' | 'week' | 'month' | 'allTime'

export type PostFilterProps = {
  totalPostCount: number
  kind: PostKind
  filter: FilterType<PostFilterType>
}

export type PostDateFilterProps = PostFilterProps & {
  filter: PostFilterType
}

export type SpaceFilterProps = {
  totalSpaceCount: number
  filter: FilterType<SpaceFilterType>
}

export type SpaceDateFilterProps = SpaceFilterProps & {
  filter: SpaceFilterType
}

export type TabsWithoutFeed = 'posts' | 'spaces' | 'comments'

export type TabKeys = TabsWithoutFeed | 'feed'

export type FilterType<T extends PostFilterType | SpaceFilterType> = {
  type: T
  date?: DateFilterType
}

export type OnFilterChangeFn = <T extends PostFilterType | SpaceFilterType>(
  value: FilterType<T>,
) => void

export type EntityFilter = PostFilterType | SpaceFilterType

export type LoadMoreValues<T extends EntityFilter> = {
  size: number
  page: number
  subsocial: SubsocialApi
  dispatch: Dispatch<any>
  myAddress?: AccountId
  kind?: PostKind
  filter: FilterType<T>
  client?: ApolloClient<object>
}

export type CreateQueryType<T extends EntityFilter> = {
  client: ApolloClient<Object>
  kind?: PostKind
  offset: number
  filter: FilterType<T>
}
