// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Empty } from 'antd'
import React from 'react'
import { MutedSpan } from './MutedText'

type Props = React.PropsWithChildren<{
  style?: React.CSSProperties
  image?: React.ReactNode
  description?: React.ReactNode
}>

export const NoData = (props: Props) => (
  <Empty
    className='DfEmpty'
    style={props.style}
    image={props.image}
    description={<MutedSpan>{props.description}</MutedSpan>}
  >
    {props.children}
  </Empty>
)

export default NoData
