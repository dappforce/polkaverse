// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { isEmptyArray, nonEmptyArr } from '@subsocial/utils'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { ButtonLink } from 'src/components/utils/CustomLinks'
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE } from 'src/config/ListData.config'
import { REGULAR_MODAL_HEIGHT } from 'src/config/Size.config'
import { tryParseInt } from 'src/utils'
import { isClientSide, isServerSide, Loading } from '../utils'
import DataList, { DataListProps } from './DataList'
import { CanHaveMoreDataFn, DataListItemProps, InnerLoadMoreFn } from './types'
import { useLinkParams } from './utils'

const DEFAULT_THRESHOLD = isClientSide() ? window.innerHeight / 2 : undefined
const DEFAULT_MODAL_THRESHOLD = isClientSide()
  ? REGULAR_MODAL_HEIGHT * window.screen.height * 0.4
  : undefined

type InnerInfiniteListProps<T> = Partial<DataListProps<T>> &
  DataListItemProps<T> & {
    loadMore: InnerLoadMoreFn<T>
    totalCount?: number
    loadingLabel?: string
    scrollableTarget?: string
    withLoadMoreLink?: boolean // Helpful for SEO
    canHaveMoreData: CanHaveMoreDataFn<T>
  }

type InfiniteListPropsByData<T> = Omit<InnerInfiniteListProps<T>, 'canHaveMoreData'>

type InfiniteListByPageProps<T> = InfiniteListPropsByData<T> & {
  totalCount: number
}

export const InfiniteListByPage = <T extends any>(props: InfiniteListByPageProps<T>) => {
  const { totalCount } = props
  const {
    query: { page: pagePath },
  } = useRouter()

  const initialPage = pagePath
    ? tryParseInt(pagePath.toString(), DEFAULT_FIRST_PAGE)
    : DEFAULT_FIRST_PAGE

  const offset = (initialPage - 1) * DEFAULT_PAGE_SIZE
  const lastPage = Math.ceil((totalCount - offset) / DEFAULT_PAGE_SIZE)

  const canHaveMoreData: CanHaveMoreDataFn<T> = (data, page) =>
    data ? (page ? page < lastPage && nonEmptyArr(data) : false) : true

  return <InnerInfiniteList {...props} canHaveMoreData={canHaveMoreData} />
}

export const InfinitePageList = <T extends any>(props: InfiniteListByPageProps<T>) => {
  return <InfiniteListByPage {...props} className='DfInfinitePageList' />
}

const canHaveMoreData = <T extends any>(currentPageItems?: T[]) => {
  return currentPageItems ? currentPageItems.length >= DEFAULT_PAGE_SIZE : true
}

export const InfiniteListByData = <T extends any>(props: InfiniteListPropsByData<T>) => (
  <InnerInfiniteList {...props} canHaveMoreData={canHaveMoreData} />
)

const InnerInfiniteList = <T extends any>(props: InnerInfiniteListProps<T>) => {
  const {
    loadingLabel = 'Loading data...',
    withLoadMoreLink = false,
    dataSource,
    getKey,
    renderItem,
    loadMore,
    totalCount,
    canHaveMoreData,
    scrollableTarget,
    ...otherProps
  } = props

  const {
    query: { page: pagePath },
  } = useRouter()

  const hasInitialData = nonEmptyArr(dataSource)

  const initialPage = pagePath
    ? tryParseInt(pagePath.toString(), DEFAULT_FIRST_PAGE)
    : DEFAULT_FIRST_PAGE

  const [page, setPage] = useState(initialPage)
  const [data, setData] = useState(dataSource || [])

  const loadingInitialState = !hasInitialData
  const [loading, setLoading] = useState(loadingInitialState)

  const [hasMore, setHasMore] = useState(canHaveMoreData(dataSource, page))

  const getLinksParams = useLinkParams({
    defaultSize: DEFAULT_PAGE_SIZE,
    triggers: [page],
  })

  const handleInfiniteOnLoad = useCallback(async (page: number) => {
    setLoading(true)
    const newData = await loadMore(page, DEFAULT_PAGE_SIZE)
    data.push(...newData)

    setData([...data])

    setHasMore(canHaveMoreData(newData, page))
    setPage(page + 1)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (hasInitialData) return setPage(page + 1)

    handleInfiniteOnLoad(page)
  }, [])

  if (!hasInitialData && isEmptyArray(data) && loading) return <Loading label={loadingLabel} />

  const linkProps = getLinksParams(page + 1)

  // Default height for modals is set to 300, hence threshold for them is 150.
  return (
    <InfiniteScroll
      dataLength={data.length}
      pullDownToRefreshThreshold={
        scrollableTarget !== undefined ? DEFAULT_MODAL_THRESHOLD : DEFAULT_THRESHOLD
      }
      next={() => handleInfiniteOnLoad(page)}
      hasMore={hasMore}
      scrollableTarget={scrollableTarget}
      loader={<Loading label={loadingLabel} />}
    >
      <DataList
        {...otherProps}
        totalCount={totalCount}
        dataSource={data}
        getKey={getKey}
        renderItem={renderItem}
      />
      {withLoadMoreLink && !loading && hasMore && (
        <ButtonLink
          block
          {...linkProps}
          className='mb-2'
          style={{ opacity: isServerSide() ? 0 : 1 }}
        >
          Load more
        </ButtonLink>
      )}
    </InfiniteScroll>
  )
}
