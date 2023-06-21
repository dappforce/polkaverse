// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { isFunction } from '@polkadot/util'
import { Row } from 'antd'
import React from 'react'
import styles from './index.module.sass'

type DomainItemProps = {
  domain: string
  action: React.ReactNode
}

export const DomainItem = ({ domain, action }: DomainItemProps) => {
  const actionComponent = isFunction(action) ? action() : action

  return (
    <Row justify='space-between' align='middle' className={styles.DomainResultItem}>
      <span>{domain}</span>
      {actionComponent}
    </Row>
  )
}
