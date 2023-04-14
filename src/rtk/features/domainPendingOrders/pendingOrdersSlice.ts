import { EntityId, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import {
  PENDING_ORDERS_BY_ACCOUNT,
  PENDING_ORDERS_BY_IDS,
} from 'src/components/domains/dot-seller/seller-queries'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { encodeAddress } from '@polkadot/util-crypto' 
import { GenericAccountId } from '@polkadot/types'
import registry from '@subsocial/api/utils/registry'

export type PendingDomainEntity = {
  id: string
  domain: string
  account: string
  clientId: string
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

  if(!entityId) return undefined

  return selectors.selectById(state, entityId)
}

export const selectPendingOrdersByIds = (state: RootState, ids: string[]) => {
  const keys = selectors.selectIds(state)

  const entityIds = keys.filter(key => ids.find(x => key.toString().includes(x)))

  return selectEntitiesByIds(state, entityIds as string[])
}

export const selectPendingOrdersByAccount = (state: RootState, address?: string) => {
  if (!address) return []
  const keys = selectors.selectIds(state)
  const genericAddress = new GenericAccountId(registry, address).toString()

  const entityIds = keys.filter(key => key.toString().includes(genericAddress))

  return selectEntitiesByIds(state, entityIds as string[])
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

  const result: any = await sellerSquidGraphQlClient.request(
    PENDING_ORDERS_BY_IDS,
    { ids },
  )

  const orders = result.getPendingOrdersByIds.orders as Omit<PendingDomainEntity, 'domain'>[]

  return orders.map(item => {
    const { id, account } = item

    const subsocialAddress: string = new GenericAccountId(registry, encodeAddress(account)).toString()
    
    return {
      ...item,
      id: `${id}-${subsocialAddress}`,
      domain: id,
      account: subsocialAddress,
    }
  })
})

export const fetchPendingOrdersByAccount = createAsyncThunk<
  MaybeEntity[],
  FetchOneWithoutApi,
  ThunkApiConfig
>(
  `${sliceName}/fetchManyByAccount`,
  async ({ id: account, reload }, { getState }): Promise<MaybeEntity[]> => {
    const knownDomainsPendingOrders = selectPendingOrdersByAccount(getState(), account.toString())

    if (!reload && !isEmptyArray(knownDomainsPendingOrders)) {
      return []
    }

    const result: any = await sellerSquidGraphQlClient.request(
      PENDING_ORDERS_BY_ACCOUNT,
      { account },
    )

    const orders = result.getPendingOrdersByAccount.orders as Omit<PendingDomainEntity, 'domain'>[]


    return orders.map(item => {
      const { id, account } = item

      const subsocialAddress: string = new GenericAccountId(registry, encodeAddress(account)).toString()
      
      return {
        ...item,
        id: `${id}-${subsocialAddress}`,
        domain: id,
        account: subsocialAddress,
      }
    })
  },
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    // upsertOwnDomains: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPendingOrdersByIds.fulfilled, (state, { payload }) => {
        if (payload) adapter.upsertMany(state, payload.filter(isDef))
      })
      .addCase(fetchPendingOrdersByAccount.fulfilled, (state, { payload }) => {
        if (payload) adapter.upsertMany(state, payload.filter(isDef))
      })
  },
})

export default slice.reducer
