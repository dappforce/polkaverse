import { EntityId } from '@reduxjs/toolkit'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useFetch } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import {
  fetchPendingOrdersByAccount,
  fetchPendingOrdersByIds,
  selectPendingOrdersByAccount,
  selectPendingOrdersById,
  selectPendingOrdersByIds,
} from './pendingOrdersSlice'

export const useFetchDomainPendingOrdersByIds = (domains: string[]) => {
  const ids = domains as EntityId[]

  useFetch(fetchPendingOrdersByIds, { ids })
}

export const useFetchDomainPendingOrdersByAccount = () => {
  const myAddress = useMyAddress()

  useFetch(fetchPendingOrdersByAccount, { id: myAddress || '' })
}

export const useSelectPendingOrderById = (id: string) => {
  return useAppSelector(state => selectPendingOrdersById(state, id))
}

export const useSelectPendingOrdersByIds = (ids: string[]) => {
  return useAppSelector(state => selectPendingOrdersByIds(state, ids))
}

export const useSelectPendingOrdersByAccount = () => {
  const myAddress = useMyAddress()
  return useAppSelector(state => selectPendingOrdersByAccount(state, myAddress))
}
