import { createSlice } from '@reduxjs/toolkit'
import { SubsocialApi } from '@subsocial/api'
import { getTopUsers } from 'src/components/utils/datahub/active-staking'
import { RootState } from 'src/rtk/app/rootReducer'
import { AppDispatch } from 'src/rtk/app/store'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'
import { fetchProfileSpaces } from '../profiles/profilesSlice'

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

export async function fetchTopUsersWithSpaces(dispatch: AppDispatch, api: SubsocialApi) {
  const { payload } = await dispatch(fetchTopUsers())
  if (!payload) return

  const parsedPayload = payload as TopUsers
  const creators = parsedPayload.creators.map(user => user.address)
  const stakers = parsedPayload.stakers.map(user => user.address)

  await dispatch(fetchProfileSpaces({ ids: [...creators, ...stakers], api }))
}

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
