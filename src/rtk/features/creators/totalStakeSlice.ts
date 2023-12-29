import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getTotalStake } from 'src/components/utils/OffchainUtils'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type TotalStake = {
  address: string
  amount: string
  hasStaked?: boolean
}

const sliceName = 'totalStakes'

const adapter = createEntityAdapter<TotalStake>({
  selectId: data => data.address,
})
const selectors = adapter.getSelectors<RootState>(state => state.totalStake)

export const selectTotalStake = selectors.selectById

export const fetchTotalStake = createSimpleFetchWrapper<{ address: string }, TotalStake>({
  sliceName,
  fetchData: async function ({ address }: { address: string }) {
    const data = await getTotalStake({ address })
    let stakeAmount = { amount: '0', hasStaked: false }
    if (data) stakeAmount = data
    const finalData = { address, ...stakeAmount }

    return finalData
  },
  getCachedData: (state, { address }) => selectTotalStake(state, address),
  saveToCacheAction: data => slice.actions.setTotalStake(data),
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setTotalStake: adapter.upsertOne,
  },
})

export default slice.reducer
