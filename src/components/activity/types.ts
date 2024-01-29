import { SubsocialApi } from '@subsocial/api'
import { AppDispatch } from 'src/rtk/app/store'
import { EventsName } from 'src/types'
import { DataListItemProps } from '../lists'
import { ParsedPaginationQuery } from '../utils/getIds'

export type LoadMoreProps = ParsedPaginationQuery & {
  subsocial: SubsocialApi
  dispatch: AppDispatch
  address?: string
  myAddress?: string
  ids?: string[]
}

type GetCountFn = (variables: { address: string }) => Promise<number>

export type LoadMoreFn<T> = (variables: {
  address: string
  offset: number
  limit: number
}) => Promise<T[]>

export type BaseActivityProps = {
  address: string
  totalCount?: number
  title?: string
  ids?: string[]
  className?: string
}

export type ActivityProps<T> = BaseActivityProps & {
  initialPage?: number
  dataSource?: T[]
  loadMore: (props: LoadMoreProps) => Promise<T[]>
  getCount?: GetCountFn
  noDataDesc?: string
  loadingLabel?: string
  ids?: string[]
}

export type InnerActivitiesProps<T> = ActivityProps<T> &
  DataListItemProps<T> & {
    shouldWaitApiReady?: boolean
  }

export type EventsMsg = {
  [key in EventsName]?: string
}

export type PathLinks = {
  links: {
    href: string
    as?: string
  }
}
