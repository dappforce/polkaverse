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
