import { EntityId } from '@reduxjs/toolkit'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetch } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import {
  RemovePendingOrderProps,
  fetchPendingOrdersByAccount,
  fetchPendingOrdersByIds,
  removePendingOrder,
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

export const useCreateReloadPendingOrdersByAccount = () => {
  return useActions<string | undefined>(({ dispatch, args }) => {
    args && dispatch(fetchPendingOrdersByAccount({ id: args }))
  })
}

export const useCreateRemovePendingOrders = () => {
  return useActions<RemovePendingOrderProps>(({ dispatch, args }) => {
    dispatch(removePendingOrder(args))
  })
}
