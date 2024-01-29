import { notDef } from '@subsocial/utils'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import config from 'src/config'
import { useMyAddress } from '../auth/MyAccountsContext'
import { InfiniteListByPage } from '../lists/InfiniteList'
import { Loading } from '../utils'
import { InnerActivitiesProps } from './types'

export function InnerActivities<T>(props: InnerActivitiesProps<T>) {
  const {
    address,
    getCount,
    totalCount,
    noDataDesc,
    loadingLabel,
    loadMore,
    ids,
    shouldWaitApiReady,
    ...otherProps
  } = props
  const { subsocial, isApiReady } = useSubsocialApi()
  const dispatch = useDispatch()

  const myAddress = useMyAddress()

  const [total, setTotalCount] = useState<number | undefined>(totalCount)

  useEffect(() => {
    if (!address || !getCount) return

    getCount ? getCount({ address }).then(setTotalCount) : setTotalCount(0)
  }, [address])

  const noData = notDef(total ?? totalCount)

  const isUsingBlockchainToFetch = shouldWaitApiReady || !config.enableSquidDataSource
  const loading = noData || (isUsingBlockchainToFetch && !isApiReady)

  const loadMoreFn = (page: number, size: number) =>
    loadMore({ subsocial, dispatch, address, myAddress, page, size, ids })

  const List = useCallback(() => {
    return loading ? (
      <Loading label={loadingLabel} />
    ) : (
      <InfiniteListByPage
        {...otherProps}
        loadMore={loadMoreFn}
        loadingLabel={loadingLabel}
        noDataDesc={noDataDesc}
        totalCount={totalCount || total || 0}
      />
    )
  }, [loading, address, total, totalCount])

  return <List />
}
