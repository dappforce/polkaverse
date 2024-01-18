import { createSlice } from '@reduxjs/toolkit'
import { getTopUsers } from 'src/components/utils/datahub/active-staking'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

type User = { address: string; superLikesCount: number }
export type TopUsers = {
  creators: User[]
  stakers: User[]
}

const sliceName = 'topUsers'

export const selectTopUsers = (state: RootState) => state.topUsers

export const fetchTopUsers = createSimpleFetchWrapper<null, TopUsers | null>({
  sliceName,
  fetchData: async function () {
    const data = await getTopUsers()
    return data
  },
  getCachedData: state => selectTopUsers(state),
  saveToCacheAction: data => slice.actions.setTopUsers(data),
})

const initialState = null as TopUsers | null
const slice = createSlice({
  name: sliceName,
  initialState: initialState,
  reducers: {
    setTopUsers: (_, action) => {
      return action.payload
    },
  },
})

export default slice.reducer
