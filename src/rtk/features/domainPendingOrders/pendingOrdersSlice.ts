import { GenericAccountId } from '@polkadot/types'
import { encodeAddress } from '@polkadot/util-crypto'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit'
import registry from '@subsocial/api/utils/registry'
import { isDef, toSubsocialAddress } from '@subsocial/utils'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import { PENDING_ORDERS_BY_ACCOUNT, PENDING_ORDERS_BY_IDS, PENDING_ORDERS_BY_SIGNER } from 'src/components/domains/dot-seller/seller-queries'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import {
  FetchOneWithoutApi,
  fetchPendingOrderByAccount,
  FetchResult,
  OrdersCommonFetchProps,
  upsertAndRemoveEntities,
} from './utils'

export type RemovePendingOrderProps = {
  domainName: string
}

export type PendingDomainEntity = {
  id: string
  createdByAccount: string
  destination: string
  purchaseInterrupted: boolean
  signer: string
  target: string
  timestamp: string
}

const sliceName = 'domainPndingOrders'

export const ordersAdapter = createEntityAdapter<PendingDomainEntity>()

const selectors = ordersAdapter.getSelectors<RootState>(state => state.ordersById)

type FetchManyWithoutApi = OrdersCommonFetchProps & {
  ids: EntityId[]
}

const selectEntitiesByIds = (state: RootState, ids: string[]) => {
  return ids.map(id => selectors.selectById(state, id)).filter(isDef)
}

export const selectPendingOrdersById = (state: RootState, id: string) => {
  const keys = selectors.selectIds(state)

  const entityId = keys.find(key => key.toString().includes(id))

  if (!entityId) return undefined

  return selectors.selectById(state, entityId)
}

export const selectPendingOrdersByIds = (state: RootState, ids: string[]) => {
  const keys = selectors.selectIds(state)

  const entityIds = keys.filter(key => ids.find(x => key.toString().includes(x)))

  return selectEntitiesByIds(state, entityIds as string[])
}

export const selectPendingOrdersByAccount = (
  state: RootState,
  field: 'signer' | 'createdByAccount',
  address?: string,
) => {
  const pendingOrdersStore = selectors.selectAll(state)

  return pendingOrdersStore.filter(item => {
    const account = item[field]

    const subsocialAddress: string = new GenericAccountId(
      registry,
      encodeAddress(account),
    ).toString()

    return subsocialAddress === address
  })
}

export const fetchPendingOrdersByIds = createAsyncThunk<
  FetchResult,
  FetchManyWithoutApi,
  ThunkApiConfig
>(`${sliceName}/fetchManyByIds`, async ({ ids, reload }, { getState }): Promise<FetchResult> => {
  const entityIds = ids as string[]
  const knownDomainsPendingOrders = selectPendingOrdersByIds(getState(), entityIds)

  if (!reload && knownDomainsPendingOrders) {
    return {
      idsToRemove: [],
      orders: [],
    }
  }

  const result: any = await sellerSquidGraphQlClient.request(PENDING_ORDERS_BY_IDS, { ids })

  const orders = result.getPendingOrdersByIds.orders as PendingDomainEntity[]

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
})

export const fetchPendingOrdersBySigner = createAsyncThunk<
  FetchResult,
  FetchOneWithoutApi,
  ThunkApiConfig
>(
  `${sliceName}/fetchManyBySigner`,
  async (fetchOneProps, { getState }): Promise<FetchResult> =>
    fetchPendingOrderByAccount({
      ...fetchOneProps,
      state: getState(),
      query: PENDING_ORDERS_BY_SIGNER,
      resultField: 'getPendingOrdersBySigner',
      selectField: 'signer',
    }),
)

export const fetchPendingOrdersByAccount = createAsyncThunk<
  FetchResult,
  FetchOneWithoutApi,
  ThunkApiConfig
>(
  `${sliceName}/fetchManyByAccount`,
  async (fetchOneProps, { getState }): Promise<FetchResult> =>
    fetchPendingOrderByAccount({
      ...fetchOneProps,
      state: getState(),
      query: PENDING_ORDERS_BY_ACCOUNT,
      resultField: 'getPendingOrdersByCreatedByAccount',
      selectField: 'createdByAccount',
    }),
)

const slice = createSlice({
  name: sliceName,
  initialState: ordersAdapter.getInitialState(),
  reducers: {
    removePendingOrder: (state, action: PayloadAction<RemovePendingOrderProps>) => {
      const { domainName } = action.payload

      ordersAdapter.removeOne(state, domainName)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPendingOrdersByIds.fulfilled, (state, { payload }) =>
        upsertAndRemoveEntities({ payload, state }),
      )
      .addCase(fetchPendingOrdersBySigner.fulfilled, (state, { payload }) =>
        upsertAndRemoveEntities({ payload, state }),
      )
      .addCase(fetchPendingOrdersByAccount.fulfilled, (state, { payload }) =>
        upsertAndRemoveEntities({ payload, state }),
      )
  },
})

export const { removePendingOrder } = slice.actions

export default slice.reducer
