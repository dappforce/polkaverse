import { createSlice } from '@reduxjs/toolkit'
import { getGeneralStatistics } from 'src/components/utils/datahub/leaderboard'
import config from 'src/config'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type GeneralStatistics = {
  postsLiked: number
  creatorsLiked: number
  stakersEarnedTotal: string
  creatorsEarnedTotal: string
}

const sliceName = 'generalStatistics'

export const selectGeneralStatistics = (state: RootState) => state.generalStatistics

export const fetchGeneralStatistics = createSimpleFetchWrapper<{}, GeneralStatistics | null>({
  sliceName,
  fetchData: async function () {
    if (!config.enableDatahub) return null
    const data = await getGeneralStatistics()
    return data
  },
  getCachedData: state => selectGeneralStatistics(state),
  saveToCacheAction: data => slice.actions.setGeneralStatistics(data),
})

const initialState = null as GeneralStatistics | null
const slice = createSlice({
  name: sliceName,
  initialState: initialState,
  reducers: {
    setGeneralStatistics: (_, action) => {
      return action.payload
    },
  },
})

export default slice.reducer
