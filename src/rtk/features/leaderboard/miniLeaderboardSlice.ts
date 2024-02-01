import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getMiniLeaderboard } from 'src/components/utils/datahub/leaderboard'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

type User = { address: string; reward: string }
export type MiniLeaderboard = {
  address: string
  creators: User[]
  stakers: User[]
}

const adapter = createEntityAdapter<MiniLeaderboard>({
  selectId: data => data.address,
})
const selectors = adapter.getSelectors<RootState>(state => state.miniLeaderboard)

const sliceName = 'miniLeaderboard'

export const selectMiniLeaderboard = selectors.selectById

export const fetchMiniLeaderboard = createSimpleFetchWrapper<
  { address: string | undefined },
  MiniLeaderboard
>({
  sliceName,
  fetchData: async function ({ address }) {
    const data = await getMiniLeaderboard(address)
    return data
  },
  getCachedData: (state, { address }) => selectMiniLeaderboard(state, address ?? ''),
  saveToCacheAction: data => slice.actions.setTopUsers(data),
})

// export async function fetchTopUsersWithSpaces(
//   store: AppStore,
//   dispatch: AppDispatch,
//   api: SubsocialApi,
// ) {
//   await dispatch(fetchTopUsers({ reload: true }))
//   const state = selectTopUsers(store.getState(), )
//   if (!state) return

//   const parsedState = state as TopUsers
//   const creators = parsedState.creators.map(user => user.address)
//   const stakers = parsedState.stakers.map(user => user.address)

//   await dispatch(fetchProfileSpaces({ ids: [...creators, ...stakers], api }))
// }

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setTopUsers: adapter.upsertOne,
  },
})

export default slice.reducer
