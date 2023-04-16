import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { isDef, isEmptyArray } from '@subsocial/utils'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import { PROCESSING_REGISTRATION_ORDERS } from 'src/components/domains/dot-seller/seller-queries'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

export type ProcessingOrdersEntity = {
  id: string
  status: string
  refundStatus: string
  target: {
    id: string
  }
}

const sliceName = 'registrationOrders'

type MaybeEntity = ProcessingOrdersEntity | undefined

const adapter = createEntityAdapter<ProcessingOrdersEntity>()

const selectors = adapter.getSelectors<RootState>(state => state.registrationOrders)

type CommonFetchProps = {
  reload?: boolean
}

type FetchOneWithoutApi = CommonFetchProps & {
  domain: string
  recipient: string
}

const selectEntitiesByIds = (state: RootState, ids: string[]) => {
  return ids.map(id => selectors.selectById(state, id)).filter(isDef)
}

export const selectProcessingOrdersById = (state: RootState, id: string) => {
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
  domain: string,
  recipient: string,
) => {
  selectors.selectById(state, `${domain}-${recipient}`)
}

export const fetchPendingOrdersByAccount = createAsyncThunk<
  MaybeEntity,
  FetchOneWithoutApi,
  ThunkApiConfig
>(
  `${sliceName}/fetchManyByAccount`,
  async ({ domain, recipient, reload }, { getState }): Promise<MaybeEntity> => {
    const knownDomainsPendingOrders = selectPendingOrdersByAccount(getState(), domain, recipient)

    if (!reload && !isEmptyArray(knownDomainsPendingOrders)) {
      return
    }

    const result: any = await sellerSquidGraphQlClient.request(PROCESSING_REGISTRATION_ORDERS, {
      domain,
      recipient,
    })

    const order = result.getPendingOrdersByAccount.orders?.[0] as ProcessingOrdersEntity | undefined

    if(!order) return 
    
    return {
      ...order,
      id: `${recipient}-${domain}`,
    }
  },
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    // upsertOwnDomains: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchPendingOrdersByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  },
})

export default slice.reducer
