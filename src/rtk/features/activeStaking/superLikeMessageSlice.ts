import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getSuperLikeMessage } from 'src/components/utils/datahub/active-staking'
import config from 'src/config'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleFetchWrapper } from 'src/rtk/app/wrappers'

export type SuperLikeMessage = {
  message: string
}

const sliceName = 'superLikeMessage'

export const selectSuperLikeMessage = (state: RootState) => state.superLikeMessage

export const fetchSuperLikeMessage = createSimpleFetchWrapper<{}, SuperLikeMessage>({
  sliceName,
  fetchData: async function () {
    if (!config.enableDatahub) return { message: '' }
    const message = getSuperLikeMessage()
    return message
  },
  getCachedData: state => selectSuperLikeMessage(state),
  shouldFetchCondition: cachedData => !cachedData?.message,
  saveToCacheAction: data => slice.actions.setSuperLikeMessage(data),
})

const initialState: SuperLikeMessage = {
  message: '',
}
const slice = createSlice({
  name: sliceName,
  initialState: initialState,
  reducers: {
    setSuperLikeMessage: (state, action: PayloadAction<SuperLikeMessage>) => {
      state['message'] = action.payload.message
    },
  },
})

export default slice.reducer
