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
  domains: string[]
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

export const selectProcessingOrdersByIds = (state: RootState, ids: string[]) => {
  const keys = selectors.selectIds(state)

  const entityIds = keys.filter(key => ids.find(x => key.toString().includes(x)))

  return selectEntitiesByIds(state, entityIds as string[])
}

export const selectProcessingOrdersByAccount = (state: RootState, address?: string) => {
  if (!address) return []
  const keys = selectors.selectIds(state)

  const entityIds = keys.filter(key => key.toString().includes(address))

  return selectEntitiesByIds(state, entityIds as string[])
}

export const fetchProcessingOrdersByAccount = createAsyncThunk<
  MaybeEntity[],
  FetchOneWithoutApi,
  ThunkApiConfig
>(
  `${sliceName}/fetchMany`,
  async ({ domains, recipient, reload }, { getState }): Promise<MaybeEntity[]> => {
    const knownDomainsPendingOrders = selectProcessingOrdersByAccount(getState(), recipient)

    if (!reload && !isEmptyArray(knownDomainsPendingOrders)) {
      return []
    }

    const result: any = await sellerSquidGraphQlClient.request(PROCESSING_REGISTRATION_ORDERS, {
      domains,
      recipient,
    })

    const orders = result.domainRegistrationOrders as
      | ProcessingOrdersEntity[]
      | undefined

    return (
      orders
        ?.map(item => {
          return {
            ...item,
          }
        })
        .filter(isDef) || []
    )
  },
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    // upsertOwnDomains: adapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchProcessingOrdersByAccount.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertMany(state, payload.filter(isDef))
    })
  },
})

export default slice.reducer
