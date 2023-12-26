import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getCreatorList } from 'src/components/utils/OffchainUtils'
import { ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'

export type Creator = { spaceId: string }
const sliceName = 'creatorsList'

const adapter = createEntityAdapter<Creator>({
  selectId: data => data.spaceId,
})
const selectors = adapter.getSelectors<RootState>(state => state.creatorsList)

export const selectCreators = selectors.selectAll

let pendingPromise: Promise<Creator[]> | null = null
export const fetchCreators = createAsyncThunk<Creator[], { reload?: boolean }, ThunkApiConfig>(
  `${sliceName}/fetchMany`,
  async ({ reload }, { getState, dispatch }) => {
    if (!reload) {
      const fetchedData = selectCreators(getState())
      if (fetchedData.length > 0) return fetchedData
    }
    if (pendingPromise) return pendingPromise

    async function fetchData() {
      const data = await getCreatorList()
      await dispatch(slice.actions.setCreators(data))
      return data
    }
    const promise = fetchData()
    pendingPromise = promise
    await promise
    pendingPromise = null
    return promise
  },
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setCreators: adapter.setAll,
  },
})

export default slice.reducer
