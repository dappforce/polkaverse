// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
