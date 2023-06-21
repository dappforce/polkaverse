// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'

type IconWithTitleProps = {
  icon: JSX.Element
  count?: number
  label?: string
}

export const IconWithLabel = React.memo((props: IconWithTitleProps) => {
  const { icon, label, count = 0 } = props

  const countStr = count > 0 ? count.toString() : undefined

  const text = label ? label + (countStr ? ` (${countStr})` : '') : countStr

  return (
    <>
      {icon}
      {text && <span className='ml-2'>{text}</span>}
    </>
  )
})
