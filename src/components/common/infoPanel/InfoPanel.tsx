// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import styles from './InfoPanel.module.sass'

type InfoPanelProps = {
  type: 'success' | 'error' | 'warning'
  text: React.ReactNode
}

const styleByType = {
  success: styles.Success,
  error: styles.Error,
  warning: styles.Warning,
}

export const DfInfoPanel = ({ text, type }: InfoPanelProps) => {
  return (
    <div className={`${styles.InfoPanel} ${styleByType[type]}`}>
      <div className={styles.InfoPart}></div>
      <div className={styles.TextPart}>{text}</div>
    </div>
  )
}
