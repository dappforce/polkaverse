// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import clsx from 'clsx'
import { HTMLProps } from 'react'
import styles from './TopicChip.module.sass'

export interface TopicChipProps extends HTMLProps<HTMLDivElement> {
  selected?: boolean
}

export default function TopicChip({ className, selected, ...props }: TopicChipProps) {
  return (
    <div
      tabIndex={0}
      {...props}
      className={clsx(styles.Chip, selected && styles.ChipSelected, className)}
    />
  )
}
