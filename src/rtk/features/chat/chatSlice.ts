import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PostData } from '@subsocial/api/types'

const sliceName = 'chats'

type Entity = {
  type: 'post'
  data: PostData
} | null
export interface ChatEntity {
  entity: Entity
}

const initialState: ChatEntity = {
  entity: null,
}

const slice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setChatConfig: (state, action: PayloadAction<Entity>) => {
      state.entity = action.payload
    },
  },
})

export const { setChatConfig } = slice.actions

export default slice.reducer
