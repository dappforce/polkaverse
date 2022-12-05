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
