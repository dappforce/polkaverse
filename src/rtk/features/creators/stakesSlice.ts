import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getStakeAmount } from 'src/components/utils/OffchainUtils'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type StakeData = {
  address: string
  creatorSpaceId: string
  stakeAmount: string
  hasStaked: boolean
}

const sliceName = 'stakes'

export function getStakeId({
  address,
  creatorSpaceId,
}: Pick<StakeData, 'address' | 'creatorSpaceId'>) {
  return `${address}-${creatorSpaceId}`
}

const adapter = createEntityAdapter<StakeData>({
  selectId: data => getStakeId(data),
})
const selectors = adapter.getSelectors<RootState>(state => state.stakes)

export const selectStakeForCreator = selectors.selectById

export const fetchStakeData = createSimpleFetchWrapper<
  { address: string; creatorSpaceId: string },
  StakeData
>({
  fetchData: async function ({ address, creatorSpaceId }) {
    const data = await getStakeAmount({ address, spaceId: creatorSpaceId })
    let stakeAmount = { stakeAmount: '0', hasStaked: false }
    if (data) stakeAmount = data
    const finalData = { address, creatorSpaceId, ...stakeAmount }

    return finalData
  },
  saveToCacheAction: data => slice.actions.setStakeData(data),
  getCachedData: (state, { address, creatorSpaceId }) =>
    selectStakeForCreator(state, getStakeId({ address, creatorSpaceId })),
  sliceName,
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setStakeData: adapter.upsertOne,
  },
})

export default slice.reducer
