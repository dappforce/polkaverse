import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PostData, SpaceData } from '@subsocial/api/types'
import sortKeysRecursive from 'sort-keys-recursive'

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
      // state and payload are both not plain obj (state is proxy), so we need to convert them to plain obj first before using it to sortKeysRecursive
      const plainObjEntity = JSON.parse(JSON.stringify(state.entity || {}))
      const plainObjPayload = JSON.parse(JSON.stringify(action?.payload?.entity || {}))
      if (
        JSON.stringify(sortKeysRecursive(plainObjEntity)) !==
        JSON.stringify(sortKeysRecursive(plainObjPayload))
      ) {
        state.entity = action?.payload?.entity ?? null
      }
      if (action.payload?.withFloatingButton !== undefined)
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
