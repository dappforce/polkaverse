import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { FetchOneArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { AccountId } from 'src/types'

export type DomainMeta = {
  expiresAt: number
  owner: string
  innerValue: {
    space: string
  }
  outerValue: string
}

export type Domain = string

type Entity = {
  /** `id` is an account address that owns spaces. */
  id: AccountId
  domains: Domain[]
}

const sliceName = 'domainsByOwner'

type MaybeEntity = Entity | undefined

const adapter = createEntityAdapter<Entity>()

const selectors = adapter.getSelectors<RootState>(state => state.domainByOwner)

type Args = {}

export const selectEntityOfDomainsByOwner: SelectOneFn<Args, MaybeEntity> = (
  state,
  { id: myAddress },
) => selectors.selectById(state, myAddress)

export const selectDomainsByOwner = (state: RootState, id: AccountId) =>
  selectEntityOfDomainsByOwner(state, { id })?.domains

type FetchOneDomainsArgs = FetchOneArgs<Args>

export const fetchDomainsByOwner = createAsyncThunk<
  MaybeEntity,
  FetchOneDomainsArgs,
  ThunkApiConfig
>(`${sliceName}/fetchOne`, async ({ api, id, reload }, { getState }): Promise<MaybeEntity> => {
  const myAddress = id as AccountId
  const knownDomains = selectDomainsByOwner(getState(), myAddress)
  const isKnownOwner = typeof knownDomains !== 'undefined'
  
  if (!reload && isKnownOwner) {
    return undefined
  }

  const domains: Domain[] = await api.blockchain.domainsByOwner(myAddress)

  return {
    id: myAddress,
    domains,
  }
})

type UpsertOwnDomainsProps = {
  newDomain: string
  address: string
}

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    upsertOwnDomains: (
      state,
      action: PayloadAction<UpsertOwnDomainsProps>
    ) => {
      const { newDomain, address } = action.payload
      const domainsByAccount = state.entities[address]?.domains || []

      adapter.upsertOne(state, {
        id: address,
        domains: [ ...domainsByAccount, newDomain ]
      })

    },
  },
  extraReducers: builder => {
    builder.addCase(fetchDomainsByOwner.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertOne(state, payload)
    })
  },
})

export const {
  upsertOwnDomains,
} = slice.actions

export default slice.reducer
