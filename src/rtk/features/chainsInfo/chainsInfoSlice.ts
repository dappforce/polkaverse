// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getChainsInfo } from 'src/components/utils/OffchainUtils'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

export type RelayChain = 'polkadot' | 'kusama'

export type ChainInfo = {
  /** Chain name. */
  id: string
  nativeToken: string
  ss58Format: number
  tokenDecimals: number[]
  tokenSymbols: string[]
  icon: string
  name: string
  node: string
  paraId: string
  relayChain?: RelayChain
  connected?: boolean
}

export type MultiChainInfo = Record<string, ChainInfo | undefined>

const sliceName = 'chainsInfo'

const adapter = createEntityAdapter<ChainInfo>()

const selectors = adapter.getSelectors<RootState>(state => state.chainsInfo)

export const selectChainInfoList = selectors.selectEntities

export const fetchChainsInfo = createAsyncThunk<ChainInfo[], {}, ThunkApiConfig>(
  `${sliceName}/fetchMany`,
  async (): Promise<ChainInfo[]> => {
    const chains: Record<string, ChainInfo> = await getChainsInfo()

    if (!chains) return []

    return Object.entries(chains).map(([id, info]) => ({ ...info, id }))
  },
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    // upsertOwnDomains: adapter.upsertOne,
  },
  extraReducers: builder => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    builder.addCase(fetchChainsInfo.fulfilled, adapter.upsertMany)
  },
})

export const {
  // upsertOwnDomains,
} = slice.actions

export default slice.reducer
