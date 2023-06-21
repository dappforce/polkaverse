// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { CSSProperties } from 'react'

export type FVoid = () => void

export interface BareProps {
  className?: string
  style?: CSSProperties
}

export type ModalProps = {
  open: boolean
  hide: () => void
}
