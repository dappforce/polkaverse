// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import clsx from 'clsx'
import { HTMLProps } from 'react'

export type DfCardProps = HTMLProps<HTMLDivElement>

export default function DfCard({ className, ...props }: DfCardProps) {
  return <div className={clsx('DfCard', className)} {...props} />
}
