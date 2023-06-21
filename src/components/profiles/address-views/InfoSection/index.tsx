// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Descriptions as AntdDesc } from 'antd'
import React from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import Section from 'src/components/utils/Section'
import { BareProps } from 'src/components/utils/types'
import styles from './index.module.sass'

export type DescItem = {
  label?: React.ReactNode
  value: React.ReactNode
}

type InfoPanelProps = BareProps & {
  title?: React.ReactNode
  items?: DescItem[]
  size?: 'middle' | 'small' | 'default'
  column?: number
  layout?: 'vertical' | 'horizontal'
}

type DescriptionsProps = InfoPanelProps & {
  title: React.ReactNode
  level?: number
}

export const InfoPanel = ({
  title,
  size = 'small',
  layout,
  column = 2,
  items,
  ...bareProps
}: InfoPanelProps) => {
  const { isMobile } = useResponsiveSize()

  return (
    <AntdDesc
      {...bareProps}
      title={title}
      size={size}
      layout={layout}
      column={isMobile ? 1 : column}
    >
      {items?.map(({ label, value }, key) => (
        <AntdDesc.Item className='pb-1' key={key} label={label}>
          {value}
        </AntdDesc.Item>
      ))}
    </AntdDesc>
  )
}

export const InfoSection = ({ title, level, className, style, ...props }: DescriptionsProps) => (
  <Section
    level={level}
    title={title}
    className={`${styles.DfInfoSection} ${className}`}
    style={style}
  >
    <InfoPanel {...props} />
  </Section>
)

export default InfoSection
