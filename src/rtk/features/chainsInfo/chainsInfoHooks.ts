// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useAppSelector } from 'src/rtk/app/store'
import { MultiChainInfo, selectChainInfoList } from './chainsInfoSlice'

export const useChainInfo = () => {
  return useAppSelector<MultiChainInfo>(selectChainInfoList)
}
