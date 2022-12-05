import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { nonEmptyArr } from '@subsocial/utils'

type TopLevelDomains = {
  domains?: string[]
}

const myAccountSlice = createSlice({
  name: 'topLevelDomains',
  initialState: {} as TopLevelDomains,
  reducers: {
    setTopLevelDomains(state, { payload }: PayloadAction<string[]>) {
      if (nonEmptyArr(payload)) {
        state.domains = payload
      }
    },
  },
})

export const { setTopLevelDomains } = myAccountSlice.actions

export default myAccountSlice.reducer
