// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import { BareProps } from 'src/components/utils/types'

type Props = React.PropsWithChildren<
  BareProps & {
    id?: string
    className?: string
    outerClassName?: string
    title?: React.ReactNode
    level?: number
  }
>

export const Section = ({ title, level = 2, className, id, outerClassName, children }: Props) => {
  const renderTitle = () => {
    if (!title) return null

    const className = 'DfSection-title'
    return React.createElement(`h${level}`, { className }, title)
  }

  return (
    <div className={`${outerClassName} DfSectionOuter`}>
      <section id={id} className={`DfSection ${className}`}>
        {renderTitle()}
        {children}
      </section>
    </div>
  )
}

export default Section
