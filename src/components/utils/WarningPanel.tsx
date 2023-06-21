// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import BasicInfoPanel from './BasicInfoPanel'
import { BareProps } from './types'

export type WarningPanelProps = BareProps & {
  desc: React.ReactNode
  actions?: React.ReactNode[]
}

export const WarningPanel = ({ desc, actions, className }: WarningPanelProps) => (
  <BasicInfoPanel
    className={className}
    desc={desc}
    banner={false}
    actions={actions}
    withIcon={true}
    type='warning'
  />
)

export default WarningPanel
