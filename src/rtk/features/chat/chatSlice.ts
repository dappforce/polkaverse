import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PostData, SpaceData } from '@subsocial/api/types'

const sliceName = 'chats'

type Entity =
  | {
      type: 'post'
      data: PostData
    }
  | {
      type: 'space'
      data: SpaceData
    }
  | null
export interface ChatEntity {
  isOpen: boolean
  entity: Entity
  totalMessageCount: number
  withFloatingButton?: boolean
}

const initialState: ChatEntity = {
  isOpen: false,
  entity: null,
  totalMessageCount: 0,
  withFloatingButton: false,
}

const slice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    setChatConfig: (
      state,
      action: PayloadAction<{ entity: Entity; withFloatingButton: boolean } | null>,
    ) => {
      state.entity = action?.payload?.entity ?? null
      state.withFloatingButton = action?.payload?.withFloatingButton
      state.totalMessageCount = 0
    },
    setTotalMessageCount: (state, action: PayloadAction<number>) => {
      state.totalMessageCount = action.payload
    },
  },
})

export const { setChatConfig, setChatOpen, setTotalMessageCount } = slice.actions

export default slice.reducer
