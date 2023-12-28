import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getCreatorList } from 'src/components/utils/OffchainUtils'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type Creator = { spaceId: string }
const sliceName = 'creatorsList'

const adapter = createEntityAdapter<Creator>({
  selectId: data => data.spaceId,
})
const selectors = adapter.getSelectors<RootState>(state => state.creatorsList)

export const selectCreators = selectors.selectAll

export const fetchCreators = createSimpleFetchWrapper<{}, Creator[]>({
  sliceName,
  fetchData: async function () {
    const data = await getCreatorList()
    return data
  },
  saveToCacheAction: data => slice.actions.setCreators(data),
  getCachedData: state => selectCreators(state),
  shouldFetchCondition: cachedData => !cachedData?.length,
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setCreators: adapter.setAll,
  },
})

export default slice.reducer
