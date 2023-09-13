import { createSlice } from '@reduxjs/toolkit'

const sliceName = 'enableConfirmation'

export interface EnableConfirmationEntity {
  isOpen: boolean
}

const initialState: EnableConfirmationEntity = {
  isOpen: false,
}

const slice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    openModal: state => {
      state.isOpen = true
    },
    closeModal: state => {
      state.isOpen = false
    },
  },
})

export const { openModal: openEnableConfirmationModal, closeModal: closeEnableConfirmationModal } =
  slice.actions

export default slice.reducer
