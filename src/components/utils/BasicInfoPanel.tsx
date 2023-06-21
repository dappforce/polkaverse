// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Alert } from 'antd'
import React from 'react'
import { BareProps } from './types'

type PanelType = 'success' | 'info' | 'warning' | 'error'

export type BasicInfoPanelProps = BareProps & {
  desc: React.ReactNode
  actions?: React.ReactNode[]
  preview?: boolean
  withIcon?: boolean
  centered?: boolean
  closable?: boolean
  banner?: boolean
  type?: PanelType
}

export const BasicInfoPanel = ({
  desc,
  actions,
  centered,
  closable,
  withIcon = false,
  className,
  style,
  banner,
  type,
}: BasicInfoPanelProps) => (
  <Alert
    className={className}
    style={style}
    message={
      <div
        className={`d-flex align-items-center ${
          centered ? 'justify-content-center' : 'justify-content-between'
        }`}
      >
        <div>{desc}</div>
        <div>{actions}</div>
      </div>
    }
    banner={banner}
    showIcon={withIcon}
    closable={closable}
    type={type}
  />
)

export default BasicInfoPanel
