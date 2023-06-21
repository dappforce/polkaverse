// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { FC } from 'react'
import { BareProps } from './types'

export const Segment: FC<BareProps> = ({ children, style, className }) => (
  <div className={`DfSegment ${className}`} style={style}>
    {children}
  </div>
)

export default Segment
