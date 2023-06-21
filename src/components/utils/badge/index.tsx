// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import clsx from 'clsx'
import { BareProps } from '../types'
import styles from './index.module.sass'

type TextBadgeProps = BareProps & {
  text: string
}

export const TextBadge = ({ text, className, ...props }: TextBadgeProps) => {
  return (
    <span className={clsx(styles.Badge, className)} {...props}>
      {text}
    </span>
  )
}
