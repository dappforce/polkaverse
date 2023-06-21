// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
