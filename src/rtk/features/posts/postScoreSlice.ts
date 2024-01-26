import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'src/rtk/app/rootReducer'

// TODO: remove this slice when score is not needed to be displayed anymore
export type PostScore = {
  id: string
  score: number
}

const sliceName = 'postScore'

const adapter = createEntityAdapter<PostScore>()
const selectors = adapter.getSelectors<RootState>(state => state.postScores)

export const selectPostScore = selectors.selectById

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setPostScores: adapter.upsertMany,
  },
})

export const { setPostScores } = slice.actions

export default slice.reducer
