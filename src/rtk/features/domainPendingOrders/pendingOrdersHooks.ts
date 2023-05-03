import { EntityId } from '@reduxjs/toolkit'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetch } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import {
  RemovePendingOrderProps,
  fetchPendingOrdersByAccount,
  fetchPendingOrdersByIds,
  fetchPendingOrdersBySigner,
  removePendingOrder,
  selectPendingOrdersByAccount,
  selectPendingOrdersById,
  selectPendingOrdersByIds,
} from './pendingOrdersSlice'

// TODO: check this case
export const useFetchDomainPendingOrdersByIds = (domains: string[]) => {
  const ids = domains as EntityId[]

  useFetch(fetchPendingOrdersByIds, { ids })
}

export const useFetchDomainPendingOrdersByAccount = (address?: string) => {
  const myAddress = useMyAddress()

  useFetch(fetchPendingOrdersByAccount, { id: myAddress })
  useFetch(fetchPendingOrdersBySigner, { id: address })
}

export const useSelectPendingOrderById = (id: string) => {
  return useAppSelector(state => selectPendingOrdersById(state, id))
}

export const useSelectPendingOrdersByIds = (ids: string[]) => {
  return useAppSelector(state => selectPendingOrdersByIds(state, ids))
}

export const useSelectPendingOrders = () => {
  const myAddress = useMyAddress()
  
  const ordersByAccount = useAppSelector(state => selectPendingOrdersByAccount(state, 'createdByAccount', myAddress))
  const ordersBySigner = useAppSelector(state => selectPendingOrdersByAccount(state, 'signer', myAddress))

  const ordersSet = new Set([...ordersByAccount, ...ordersBySigner])

  return Array.from(ordersSet)
}


export const useCreateReloadPendingOrders = () => {
  return useActions<string | undefined>(({ dispatch, args }) => {
    if(args) {
      dispatch(fetchPendingOrdersByAccount({ id: args, reload: true }))
      dispatch(fetchPendingOrdersBySigner({ id: args, reload: true }))
    }
  })
}

export const useCreateRemovePendingOrders = () => {
  return useActions<RemovePendingOrderProps>(({ dispatch, args }) => {
    dispatch(removePendingOrder(args))
  })
}
