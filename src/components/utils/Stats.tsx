// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import 'ant-design-pro/dist/ant-design-pro.css'
import { ChartCard, MiniArea } from 'ant-design-pro/lib/Charts'
import { Tooltip } from 'antd'
import React from 'react'
import { BareProps } from './types'

export type StatsProps = BareProps & {
  title: React.ReactNode
  total?: React.ReactNode | number
  contentHeight?: number
  areaHeight: number
  footer?: React.ReactNode
  className?: string | undefined
  data: Array<{
    x: number | string
    y: number
  }>
}

export const Stats = ({
  title,
  total,
  contentHeight,
  areaHeight,
  footer,
  className,
  data,
}: StatsProps) => {
  return (
    <Tooltip title={'Click to enlarge'}>
      <ChartCard
        className={className}
        title={title}
        total={total}
        contentHeight={contentHeight}
        footer={footer}
      >
        <MiniArea line borderColor={'#bd018b'} color={'#ffb3ea'} height={areaHeight} data={data} />
      </ChartCard>
    </Tooltip>
  )
}
