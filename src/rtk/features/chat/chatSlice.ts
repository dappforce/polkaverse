import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PostData } from '@subsocial/api/types'

const sliceName = 'chats'

type Entity = {
  type: 'post'
  data: PostData
} | null
export interface ChatEntity {
  isOpen: boolean
  entity: Entity
  totalMessageCount: number
}

const initialState: ChatEntity = {
  isOpen: false,
  entity: null,
  totalMessageCount: 0,
}

const slice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    setChatConfig: (state, action: PayloadAction<Entity>) => {
      state.entity = action.payload
      state.totalMessageCount = 0
    },
    setTotalMessageCount: (state, action: PayloadAction<number>) => {
      state.totalMessageCount = action.payload
    },
  },
})

export const { setChatConfig, setChatOpen, setTotalMessageCount } = slice.actions

export default slice.reducer
