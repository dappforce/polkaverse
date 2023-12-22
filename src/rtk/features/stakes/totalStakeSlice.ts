import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getTotalStake } from 'src/components/utils/OffchainUtils'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

export type TotalStake = {
  address: string
  amount: string
  isZero?: boolean
}

const sliceName = 'totalStakes'

const adapter = createEntityAdapter<TotalStake>({
  selectId: data => data.address,
})
const selectors = adapter.getSelectors<RootState>(state => state.totalStake)

export const selectTotalStake = selectors.selectById

const currentlyFetchingMap = new Map<string, Promise<TotalStake>>()
export const fetchTotalStake = createAsyncThunk<
  TotalStake,
  {
    address: string
    reload?: boolean
  },
  ThunkApiConfig
>(`${sliceName}/fetchOne`, async ({ address, reload }, { getState }): Promise<TotalStake> => {
  const id = address
  if (!reload) {
    const fetchedData = selectTotalStake(getState(), id)
    if (fetchedData) return fetchedData
  }
  const alreadyFetchedPromise = currentlyFetchingMap.get(id)
  if (alreadyFetchedPromise) return alreadyFetchedPromise

  async function fetchData() {
    const data = await getTotalStake({ address })
    let stakeAmount = { amount: '0', isZero: true }
    if (data) stakeAmount = data
    return { address, ...stakeAmount }
  }
  const promise = fetchData()
  currentlyFetchingMap.set(id, promise)
  await promise
  currentlyFetchingMap.delete(id)
  return promise
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {},
  extraReducers: builder => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    builder.addCase(fetchTotalStake.fulfilled, adapter.upsertOne)
  },
})

export default slice.reducer
