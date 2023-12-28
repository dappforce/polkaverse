import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getStakeAmount } from 'src/components/utils/OffchainUtils'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

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

const currentlyFetchingMap = new Map<string, Promise<StakeData>>()
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
  async ({ address, creatorSpaceId, reload }, { getState, dispatch }): Promise<StakeData> => {
    const id = getStakeId({ address, creatorSpaceId })
    if (!reload) {
      const fetchedData = selectStakeForCreator(getState(), id)
      if (fetchedData) return fetchedData
    }
    const alreadyFetchedPromise = currentlyFetchingMap.get(id)
    if (alreadyFetchedPromise) return alreadyFetchedPromise

    async function fetchData() {
      const data = await getStakeAmount({ address, spaceId: creatorSpaceId })
      const stakeAmount = data ? data : { stakeAmount: '0', hasStaked: false }
      const finalData = { address, creatorSpaceId, ...stakeAmount }

      await dispatch(slice.actions.setStakeData(finalData))
      return finalData
    }
    const promise = fetchData()
    currentlyFetchingMap.set(id, promise)
    await promise
    currentlyFetchingMap.delete(id)
    return promise
  },
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setStakeData: adapter.upsertOne,
  },
})

export default slice.reducer
