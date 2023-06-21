// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { EllipsisOutlined } from '@ant-design/icons'
import { Dropdown, Menu } from 'antd'
import React, { useState } from 'react'
import { BareProps } from 'src/components/utils/types'

export type BasicDropDownMenuProps = BareProps & {
  vertical?: boolean
}

type InnerDropDownMenuProps = BasicDropDownMenuProps & {
  buildMenuItems: () => React.ReactNode
}

const InnerDropdownMenu = (props: InnerDropDownMenuProps) => {
  const { buildMenuItems, vertical, style, className } = props

  const [visible, setVisible] = useState(true)

  const onVisibleChange = (flag: boolean) => setVisible(flag)
  const close = () => setVisible(false)

  const menu = () => <Menu onClick={close}>{buildMenuItems()}</Menu>

  return (
    <Dropdown
      overlay={menu}
      visible={visible}
      onVisibleChange={onVisibleChange}
      placement='bottomRight'
    >
      <EllipsisOutlined
        rotate={vertical ? 90 : 0}
        style={style}
        className={`IconFontSize mx-2 ${className}`}
      />
    </Dropdown>
  )
}

export const DropdownMenu = (props: InnerDropDownMenuProps) => {
  const { vertical, style } = props
  const [stub, setStub] = useState(true)

  const closeStub = () => setStub(false)

  return stub ? (
    <EllipsisOutlined
      onClick={closeStub}
      className={`IconFontSize mx-2 ${props.className}`}
      rotate={vertical ? 90 : 0}
      style={style}
    />
  ) : (
    <InnerDropdownMenu {...props} />
  )
}
