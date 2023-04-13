import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { isDef } from '@subsocial/utils'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import {
  PENDING_ORDERS_BY_ACCOUNT,
  PENDING_ORDERS_BY_IDS,
} from 'src/components/domains/dot-seller/seller-queries'
import { FetchManyArgs, FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

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

type Args = {}

const selectEntitiesByIds = (state: RootState, ids: string[]) => {
  return ids.map(id => selectors.selectById(state, id)).filter(isDef)
}

export const selectPendingOrdersByIds = (state: RootState, ids: string[]) => {
  const keys = selectors.selectIds(state)

  const entityIds = keys.filter(key => ids.find(x => key.toString().includes(x)))

  return selectEntitiesByIds(state, entityIds as string[])
}

export const selectPendingOrdersByAccount = (state: RootState, address?: string) => {
  if (!address) return []
  const keys = selectors.selectIds(state)

  const entityIds = keys.filter(key => key.toString().includes(address))

  return selectEntitiesByIds(state, entityIds as string[])
}

export const fetchPendingOrdersByIds = createAsyncThunk<
  MaybeEntity[],
  FetchManyArgs<Args>,
  ThunkApiConfig
>(`${sliceName}/fetchManyByIds`, async ({ ids, reload }, { getState }): Promise<MaybeEntity[]> => {
  const entityIds = ids as string[]
  const knownDomainsPendingOrders = selectPendingOrdersByIds(getState(), entityIds)

  if (!reload && knownDomainsPendingOrders) {
    return []
  }

  const result: Omit<PendingDomainEntity, 'domain'>[] = await sellerSquidGraphQlClient.request(
    PENDING_ORDERS_BY_IDS,
    { ids },
  )

  return result.map(item => {
    const { id, account } = item

    return {
      ...item,
      id: `${id}-${account}`,
      domain: id,
      account,
    }
  })
})

export const fetchPendingOrdersByAccount = createAsyncThunk<
  MaybeEntity[],
  FetchOneArgs<Args>,
  ThunkApiConfig
>(
  `${sliceName}/fetchManyByAccount`,
  async ({ id: account, reload }, { getState }): Promise<MaybeEntity[]> => {
    const knownDomainsPendingOrders = selectPendingOrdersByAccount(getState(), account.toString())

    if (!reload && knownDomainsPendingOrders) {
      return []
    }

    const result: Omit<PendingDomainEntity, 'domain'>[] = await sellerSquidGraphQlClient.request(
      PENDING_ORDERS_BY_ACCOUNT,
      { account },
    )

    return result.map(item => {
      const { id, account } = item

      return {
        ...item,
        id: `${id}-${account}`,
        domain: id,
        account,
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
