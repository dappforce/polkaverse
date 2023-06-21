// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import BasicInfoPanel, { BasicInfoPanelProps } from '../BasicInfoPanel'
import styles from './index.module.sass'

export type EntityStatusProps = Partial<BasicInfoPanelProps>

export const EntityStatusPanel = ({
  desc,
  actions,
  preview = false,
  centered = false,
  withIcon = true,
  className,
  style,
}: EntityStatusProps) => {
  const alertCss = preview ? styles.DfEntityStatusInPreview : styles.DfEntityStatusOnPage

  return (
    <BasicInfoPanel
      className={`${styles.DfEntityStatus} ${alertCss} ${className}`}
      style={style}
      desc={desc}
      actions={actions}
      centered={centered}
      withIcon={withIcon}
      banner={true}
      type={'warning'}
    />
  )
}

type EntityStatusGroupProps = React.PropsWithChildren<{}>

export const EntityStatusGroup = ({ children }: EntityStatusGroupProps) =>
  children ? <div className={styles.DfEntityStatusGroup}>{children}</div> : null
