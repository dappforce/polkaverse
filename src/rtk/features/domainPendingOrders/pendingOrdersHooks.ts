import { useFetch } from 'src/rtk/app/hooksCommon'
import { fetchPendingOrdersByAccount, fetchPendingOrdersByIds, selectPendingOrdersByAccount, selectPendingOrdersByIds } from './pendingOrdersSlice'
import { EntityId } from '@reduxjs/toolkit'
import { useAppSelector } from 'src/rtk/app/store'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'

export const useFetchDomainPendingOrdersByIds = (domains: string[]) => {
  const ids = domains as EntityId[]

  useFetch(fetchPendingOrdersByIds, { ids })
}

export const useFetchDomainPendingOrdersByAccount = () => {
  const myAddress = useMyAddress()

  useFetch(fetchPendingOrdersByAccount, { id: myAddress || '' })
}

export const useSelectPendingOrdersByIds = (ids: string[]) => {
  return useAppSelector((state) => selectPendingOrdersByIds(state, ids))
}

export const useSelectPendingOrdersByAccount = () => {
  const myAddress = useMyAddress()
  return useAppSelector((state) => selectPendingOrdersByAccount(state, myAddress))
}
