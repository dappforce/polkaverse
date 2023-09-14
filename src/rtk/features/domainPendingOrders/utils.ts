import { EntityId } from '@reduxjs/toolkit'
import { isDef, isEmptyArray, toSubsocialAddress } from '@subsocial/utils'
import { DocumentNode } from 'graphql'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import { RootState } from 'src/rtk/app/rootReducer'
import {
  ordersAdapter,
  PendingDomainEntity,
  selectPendingOrdersByAccount,
} from './pendingOrdersSlice'

export type MaybeEntity = PendingDomainEntity | undefined

export type FetchResult = {
  idsToRemove: string[]
  orders: MaybeEntity[]
}

export type OrdersCommonFetchProps = {
  reload?: boolean
}

export type FetchOneWithoutApi = OrdersCommonFetchProps & {
  id?: EntityId
}

type GetOrdersProps = {
  query: DocumentNode
  params: any
  resultField: string
  knownDomainsPendingOrders: PendingDomainEntity[]
}

export const getOrders = async ({
  query,
  params,
  knownDomainsPendingOrders,
  resultField,
}: GetOrdersProps) => {
  const result: any = await sellerSquidGraphQlClient.request(query, params)

  const orders = result[resultField].orders as PendingDomainEntity[]

  const parsedOrders = orders.map(order => {
    const { signer, target, createdByAccount } = order

    return {
      ...order,
      target: toSubsocialAddress(target) || '',
      signer: toSubsocialAddress(signer) || '',
      createdByAccount: toSubsocialAddress(createdByAccount) || '',
    }
  })

  const parsedOrdersIds = parsedOrders.map(order => order.id)
  const knownOrdersIds = knownDomainsPendingOrders.map(order => order.id)

  const idsToRemove: string[] = knownOrdersIds.filter(knownId => !parsedOrdersIds.includes(knownId))

  return {
    idsToRemove,
    orders: parsedOrders,
  }
}

type FetchOrdersByAccountProps = FetchOneWithoutApi & {
  state: RootState
  query: DocumentNode
  resultField: 'getPendingOrdersBySigner' | 'getPendingOrdersByCreatedByAccount'
  selectField: 'signer' | 'createdByAccount'
}

export const fetchPendingOrderByAccount = async ({
  id: account,
  reload,
  state,
  query,
  resultField,
  selectField,
}: FetchOrdersByAccountProps) => {
  const knownDomainsPendingOrders = selectPendingOrdersByAccount(
    state,
    selectField,
    account?.toString(),
  )

  if ((!reload && !isEmptyArray(knownDomainsPendingOrders)) || !account) {
    return {
      idsToRemove: [],
      orders: [],
    }
  }

  return getOrders({
    query,
    params: {
      [`${selectField}`]: account,
    },
    knownDomainsPendingOrders,
    resultField,
  })
}

type UpsertAndRemoveEntitiesProps = {
  payload: FetchResult
  state: any
}

export const upsertAndRemoveEntities = ({ payload, state }: UpsertAndRemoveEntitiesProps) => {
  const { idsToRemove, orders } = payload

  if (!orders) return

  if (!isEmptyArray(idsToRemove)) {
    ordersAdapter.removeMany(state, idsToRemove)
  }

  ordersAdapter.upsertMany(state, orders.filter(isDef))
}
