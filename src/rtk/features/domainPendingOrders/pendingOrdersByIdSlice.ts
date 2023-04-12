import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { isDef } from '@subsocial/utils'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import { PENDING_ORDERS_BY_ACCOUNT, PENDING_ORDERS_BY_IDS } from 'src/components/domains/dot-seller/seller-queries'
import { FetchManyArgs, FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

export type OrderMeta = {
  id: string
  account: string
  clientId: string
  timestamp: string
}

export type Domain = string

type Entity = {
  id: string
  account: string
  clientId: string
  timestamp: string
}

const sliceName = 'domainsByOwner'

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

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

export const selectPendingOrdersByAccount = (state: RootState, address: string) => {
  const keys = selectors.selectIds(state)

  const entityIds = keys.filter(key => key.toString().includes(address))

  return selectEntitiesByIds(state, entityIds as string[])
}

export const fetchPendingOrdersByIds = createAsyncThunk<
  MaybeEntity[],
  FetchManyArgs<Args>,
  ThunkApiConfig
>(`${sliceName}/fetchOne`, async ({ ids }): Promise<MaybeEntity[]> => {
  const result: MaybeEntity[] = await sellerSquidGraphQlClient.request(PENDING_ORDERS_BY_IDS, { ids })

  return result

  // const myAddress = id as AccountId
  // const knownDomains = selectDomainsByOwner(getState(), myAddress)
  // const isKnownOwner = typeof knownDomains !== 'undefined'
  // if (!reload && isKnownOwner) {
  //   return undefined
  // }

  // const domains: Domain[] = await api.blockchain.domainsByOwner(myAddress)

  // return {
  //   id: myAddress,
  //   domains,
  // }
})

export const fetchPendingOrdersByAccount = createAsyncThunk<
  MaybeEntity[],
  FetchOneArgs<Args>,
  ThunkApiConfig
>(`${sliceName}/fetchOne`, async ({ id: account }): Promise<MaybeEntity[]> => {
  const result: MaybeEntity[] = await sellerSquidGraphQlClient.request(PENDING_ORDERS_BY_ACCOUNT, { account })

  return result

  // const myAddress = id as AccountId
  // const knownDomains = selectDomainsByOwner(getState(), myAddress)
  // const isKnownOwner = typeof knownDomains !== 'undefined'
  // if (!reload && isKnownOwner) {
  //   return undefined
  // }

  // const domains: Domain[] = await api.blockchain.domainsByOwner(myAddress)

  // return {
  //   id: myAddress,
  //   domains,
  // }
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    // upsertOwnDomains: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchPendingOrdersByIds.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertMany(state, payload.filter(isDef))
    })
    builder.addCase(fetchPendingOrdersByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertMany(state, payload.filter(isDef))
    })
  },
})

export default slice.reducer
