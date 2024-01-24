import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getLeaderboardData, LeaderboardRole } from 'src/components/utils/datahub/leaderboard'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type LeaderboardData = {
  total: number
  page: number
  data: { reward: string; rank: number; address: string }[]
  hasMore: boolean
  role: LeaderboardRole
}
export type Leaderboard = Record<LeaderboardRole, LeaderboardData>

const sliceName = 'leaderboard'

export const selectLeaderboard = (state: RootState) => state.leaderboard

export const fetchLeaderboardData = createSimpleFetchWrapper<
  { role: LeaderboardRole },
  LeaderboardData
>({
  sliceName,
  fetchData: async function ({ role }, state) {
    const currentData = selectLeaderboard(state)[role]
    const data = await getLeaderboardData({ role, page: currentData.page + 1 })
    return data
  },
  getCachedData: (state, payload) => selectLeaderboard(state)[payload.role],
  shouldFetchCondition: cachedData => !!cachedData?.hasMore,
  saveToCacheAction: data => slice.actions.setLeaderboardData(data),
})

const initialState: Leaderboard = {
  creator: {
    data: [],
    hasMore: true,
    page: 0,
    total: 0,
    role: 'creator',
  },
  staker: {
    data: [],
    hasMore: true,
    page: 0,
    total: 0,
    role: 'staker',
  },
}
const slice = createSlice({
  name: sliceName,
  initialState: initialState,
  reducers: {
    setLeaderboardData: (state, action: PayloadAction<LeaderboardData>) => {
      const role = action.payload.role
      const oldData = state[role].data
      state[role] = action.payload
      state[role].data = [...oldData, ...action.payload.data]
    },
  },
})

export default slice.reducer
