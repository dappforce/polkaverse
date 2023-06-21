// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import BasicInfoPanel from './BasicInfoPanel'
import { BareProps } from './types'

export type SuccessPanelProps = BareProps & {
  desc: React.ReactNode
}

export const SuccessPanel = ({ desc, className }: SuccessPanelProps) => (
  <BasicInfoPanel className={className} desc={desc} banner={false} withIcon={true} type='success' />
)

export default SuccessPanel
