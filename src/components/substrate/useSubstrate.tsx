// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useContext } from 'react'
import { State, SubstrateContext } from './SubstrateContext'

export const useSubstrate = (): State => {
  const state = useContext(SubstrateContext)
  return state
}

export default useSubstrate
