import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { isEmptyArray } from '@subsocial/utils'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import { SELLER_CONFIG } from 'src/components/domains/dot-seller/seller-queries'
import { CommonFetchProps, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

export type SellerConfigEntity = {
  id: string
  dmnRegPendingOrderExpTime: number
  domainHostChain: string
  domainHostChainPrefix: string
  domainRegistrationPriceFixed: string
  remarkProtName: string
  remarkProtVersion: string
  sellerApiAuthTokenManager: string
  sellerChain: string
  sellerChainPrefix: 42
  sellerTreasuryAccount: string
  sellerToken: {
    decimal: number
    name: string
  }
}

const sliceName = 'sellerConfig'

export const sellerConfigId = 'config'

type MaybeEntity = SellerConfigEntity | undefined

const adapter = createEntityAdapter<SellerConfigEntity>()

const selectors = adapter.getSelectors<RootState>(state => state.sellerConfig)

export const selectSellerConfig = (state: RootState): SellerConfigEntity | undefined => {
  return selectors.selectById(state, sellerConfigId)
}

export const fetchSellerConfig = createAsyncThunk<
  MaybeEntity,
  CommonFetchProps,
  ThunkApiConfig
>(
  `${sliceName}/fetchOne`,
  async ({ reload }, { getState }): Promise<MaybeEntity> => {
    const knownDomainsPendingOrders = selectSellerConfig(getState())

    if (!reload && !isEmptyArray(knownDomainsPendingOrders)) {
      return undefined
    }

    const result: any = await sellerSquidGraphQlClient.request(SELLER_CONFIG)

    return {
      id: sellerConfigId,
      ...result.sellerConfigInfo
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
    builder
      .addCase(fetchSellerConfig.fulfilled, (state, { payload }) => {
        if (payload) adapter.upsertOne(state, payload)
      })
  },
})

export default slice.reducer
