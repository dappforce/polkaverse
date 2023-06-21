// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'

type Props = {
  title: React.ReactNode
  className?: string
}

export const SubTitle = ({ title, className }: Props) => (
  <div className={`text-left DfSubTitle ${className}`}>{title}</div>
)

export default SubTitle
