import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getStakeAmount } from 'src/components/utils/OffchainUtils'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

export type RelayChain = 'polkadot' | 'kusama'

export type StakeData = {
  address: string
  creatorSpaceId: string
  stakeAmount: string
  isZero: boolean
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

export const fetchStakeData = createAsyncThunk<
  StakeData,
  {
    address: string
    creatorSpaceId: string
    reload?: boolean
  },
  ThunkApiConfig
>(
  `${sliceName}/fetchOne`,
  async ({ address, creatorSpaceId, reload }, { getState }): Promise<StakeData> => {
    if (!reload) {
      const fetchedData = selectStakeForCreator(getState(), getStakeId({ address, creatorSpaceId }))
      if (fetchedData) return fetchedData
    }

    const data = await getStakeAmount({ address, spaceId: creatorSpaceId })
    let stakeAmount = { stakeAmount: '0', isZero: true }
    if (data) stakeAmount = data
    return { address, creatorSpaceId, ...stakeAmount }
  },
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: builder => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    builder.addCase(fetchStakeData.fulfilled, adapter.upsertOne)
  },
})

export default slice.reducer
