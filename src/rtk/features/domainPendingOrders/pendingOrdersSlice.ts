import { decodeAddress } from '@polkadot/keyring'
import { GenericAccountId } from '@polkadot/types'
import { u8aToHex } from '@polkadot/util'
import { encodeAddress } from '@polkadot/util-crypto'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit'
import registry from '@subsocial/api/utils/registry'
import { isDef, isEmptyArray, toSubsocialAddress } from '@subsocial/utils'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import {
  PENDING_ORDERS_BY_ACCOUNT,
  PENDING_ORDERS_BY_IDS,
  PENDING_ORDERS_BY_SIGNER,
} from 'src/components/domains/dot-seller/seller-queries'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

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

type MaybeEntity = PendingDomainEntity | undefined

type FetchResult = {
  idsToRemove: string[]
  orders: MaybeEntity[]
}

const adapter = createEntityAdapter<PendingDomainEntity>()

const selectors = adapter.getSelectors<RootState>(state => state.ordersById)

type CommonFetchProps = {
  reload?: boolean
}

type FetchOneWithoutApi = CommonFetchProps & {
  id: EntityId
}

type FetchManyWithoutApi = CommonFetchProps & {
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
      orders: []
    }
  }

  const result: any = await sellerSquidGraphQlClient.request(PENDING_ORDERS_BY_IDS, { ids })

  const orders = result.getPendingOrdersByIds.orders as PendingDomainEntity[]

  const parsedOrders = orders.map(order => {
    const { signer, createdByAccount } = order

    return {
      ...order,
      signer: toSubsocialAddress(signer) || '',
      createdByAccount: toSubsocialAddress(createdByAccount) || '',
    }
  })

  const parsedOrdersIds = parsedOrders.map((order) => order.id)
  const knownOrdersIds = knownDomainsPendingOrders.map((order) => order.id)

  const idsToRemove: string[] = knownOrdersIds.filter(knownId => !parsedOrdersIds.includes(knownId))

  return {
    idsToRemove,
    orders: parsedOrders
  }
})

export const fetchPendingOrdersBySigner = createAsyncThunk<
  FetchResult,
  FetchOneWithoutApi,
  ThunkApiConfig
>(
  `${sliceName}/fetchManyBySigner`,
  async ({ id: account, reload }, { getState }): Promise<FetchResult> => {
    const knownDomainsPendingOrders = selectPendingOrdersByAccount(
      getState(),
      'signer',
      account.toString(),
    )

    if (!reload && !isEmptyArray(knownDomainsPendingOrders)) {
      return {
        idsToRemove: [],
        orders: []
      }
    }

    const result: any = await sellerSquidGraphQlClient.request(PENDING_ORDERS_BY_SIGNER, {
      signer: account,
    })

    const orders = result.getPendingOrdersBySigner.orders as PendingDomainEntity[]

    const parsedOrders = orders.map(order => {
      const { signer, createdByAccount } = order

      return {
        ...order,
        signer: toSubsocialAddress(signer) || '',
        createdByAccount: toSubsocialAddress(createdByAccount) || '',
      }
    })

    const parsedOrdersIds = parsedOrders.map((order) => order.id)
    const knownOrdersIds = knownDomainsPendingOrders.map((order) => order.id)

    const idsToRemove: string[] = knownOrdersIds.filter(knownId => !parsedOrdersIds.includes(knownId))

    return {
      idsToRemove,
      orders: parsedOrders
    }
  },
)

export const fetchPendingOrdersByAccount = createAsyncThunk<
  FetchResult,
  FetchOneWithoutApi,
  ThunkApiConfig
>(
  `${sliceName}/fetchManyByAccount`,
  async ({ id: account, reload }, { getState }): Promise<FetchResult> => {
    const knownDomainsPendingOrders = selectPendingOrdersByAccount(
      getState(),
      'createdByAccount',
      account.toString(),
    )

    if (!reload && !isEmptyArray(knownDomainsPendingOrders)) {
      return {
        idsToRemove: [],
        orders: []
      }
    }

    const decodedAddress = u8aToHex(decodeAddress(account.toString()))

    const result: any = await sellerSquidGraphQlClient.request(PENDING_ORDERS_BY_ACCOUNT, {
      createdByAccount: decodedAddress,
    })

    const orders = result.getPendingOrdersByCreatedByAccount.orders as PendingDomainEntity[]

    const parsedOrders = orders.map(order => {
      const { signer, createdByAccount } = order

      return {
        ...order,
        signer: toSubsocialAddress(signer) || '',
        createdByAccount: toSubsocialAddress(createdByAccount) || '',
      }
    })

    const parsedOrdersIds = parsedOrders.map((order) => order.id)
    const knownOrdersIds = knownDomainsPendingOrders.map((order) => order.id)

    const idsToRemove: string[] = knownOrdersIds.filter(knownId => !parsedOrdersIds.includes(knownId))

    return {
      idsToRemove,
      orders: parsedOrders
    }
  },
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    removePendingOrder: (state, action: PayloadAction<RemovePendingOrderProps>) => {
      const { domainName } = action.payload

      adapter.removeOne(state, domainName)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPendingOrdersByIds.fulfilled, (state, { payload }) => {
        const { idsToRemove, orders } = payload

        if(!orders) return 

        if(!isEmptyArray(idsToRemove)) {
          adapter.removeMany(state, idsToRemove)
        }

        adapter.upsertMany(state, orders.filter(isDef))
      })
      .addCase(fetchPendingOrdersBySigner.fulfilled, (state, { payload }) => {
        const { idsToRemove, orders } = payload

        if(!orders) return 

        if(!isEmptyArray(idsToRemove)) {
          adapter.removeMany(state, idsToRemove)
        }

        adapter.upsertMany(state, orders.filter(isDef))
      })
      .addCase(fetchPendingOrdersByAccount.fulfilled, (state, { payload }) => {
        const { idsToRemove, orders } = payload

        if(!orders) return 

        if(!isEmptyArray(idsToRemove)) {
          adapter.removeMany(state, idsToRemove)
        }

        adapter.upsertMany(state, orders.filter(isDef))
      })
  },
})

export const { removePendingOrder } = slice.actions

export default slice.reducer
