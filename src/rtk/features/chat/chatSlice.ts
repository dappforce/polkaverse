import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GrillConfig } from '@subsocial/grill-widget'

const sliceName = 'chats'

export interface chatEntity {
  isChatWindowOpen: boolean
  currentConfig?: GrillConfig
}

const initialState: chatEntity = {
  isChatWindowOpen: false,
}

const slice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setChatWindowVisibility: (state, action: PayloadAction<boolean>) => {
      state.isChatWindowOpen = action.payload
    },
    setCurrentConfig: (state, action: PayloadAction<GrillConfig>) => {
      state.currentConfig = action.payload
    },
  },
})

export const { setChatWindowVisibility, setCurrentConfig } = slice.actions

export default slice.reducer
