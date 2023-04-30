import { GenericAccountId } from '@polkadot/types'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityId,
  PayloadAction,
} from '@reduxjs/toolkit'
import registry from '@subsocial/api/utils/registry'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import {
  PENDING_ORDERS_BY_ACCOUNT,
  PENDING_ORDERS_BY_IDS,
  PENDING_ORDERS_BY_SIGNER,
} from 'src/components/domains/dot-seller/seller-queries'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { encodeAddress } from '@polkadot/util-crypto'
import { decodeAddress } from '@polkadot/keyring'
import { u8aToHex } from '@polkadot/util'

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

export const selectPendingOrdersByAccount = (state: RootState, field: 'signer' | 'createdByAccount', address?: string) => {
  const pendingOrdersStore = selectors.selectAll(state)

  return pendingOrdersStore.filter((item) => {
    const account = item[field]

    const subsocialAddress: string = new GenericAccountId(registry, encodeAddress(account)).toString()

    return subsocialAddress === address
  })
}

export const fetchPendingOrdersByIds = createAsyncThunk<
  MaybeEntity[],
  FetchManyWithoutApi,
  ThunkApiConfig
>(`${sliceName}/fetchManyByIds`, async ({ ids, reload }, { getState }): Promise<MaybeEntity[]> => {
  const entityIds = ids as string[]
  const knownDomainsPendingOrders = selectPendingOrdersByIds(getState(), entityIds)

  if (!reload && knownDomainsPendingOrders) {
    return []
  }

  const result: any = await sellerSquidGraphQlClient.request(PENDING_ORDERS_BY_IDS, { ids })

  return result.getPendingOrdersByIds.orders as PendingDomainEntity[]
})

export const fetchPendingOrdersBySigner = createAsyncThunk<
  MaybeEntity[],
  FetchOneWithoutApi,
  ThunkApiConfig
>(
  `${sliceName}/fetchManyBySigner`,
  async ({ id: account, reload }, { getState }): Promise<MaybeEntity[]> => {
    const knownDomainsPendingOrders = selectPendingOrdersByAccount(getState(), 'signer', account.toString())

    if (!reload && !isEmptyArray(knownDomainsPendingOrders)) {
      return []
    }

    const result: any = await sellerSquidGraphQlClient.request(PENDING_ORDERS_BY_SIGNER, {
      signer: account,
    })

    return result.getPendingOrdersBySigner.orders as PendingDomainEntity[]
  },
)

export const fetchPendingOrdersByAccount = createAsyncThunk<
  MaybeEntity[],
  FetchOneWithoutApi,
  ThunkApiConfig
>(
  `${sliceName}/fetchManyByAccount`,
  async ({ id: account, reload }, { getState }): Promise<MaybeEntity[]> => {
    const knownDomainsPendingOrders = selectPendingOrdersByAccount(getState(), 'createdByAccount', account.toString())

    if (!reload && !isEmptyArray(knownDomainsPendingOrders)) {
      return []
    }

    const decodedAddress = u8aToHex(decodeAddress(account.toString()))
    console.log(decodedAddress)

    const result: any = await sellerSquidGraphQlClient.request(PENDING_ORDERS_BY_ACCOUNT, {
      createdByAccount: decodedAddress,
    })

    return result.getPendingOrdersByCreatedByAccount.orders as PendingDomainEntity[]
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
        adapter.removeAll(state)
        adapter.upsertMany(state, payload.filter(isDef))
      })
      .addCase(fetchPendingOrdersBySigner.fulfilled, (state, { payload }) => {
        adapter.removeAll(state)
        adapter.addMany(state, payload.filter(isDef))
      })
      .addCase(fetchPendingOrdersByAccount.fulfilled, (state, { payload }) => {
        adapter.removeAll(state)
        adapter.addMany(state, payload.filter(isDef))
      })
  },
})

export const { removePendingOrder } = slice.actions

export default slice.reducer
