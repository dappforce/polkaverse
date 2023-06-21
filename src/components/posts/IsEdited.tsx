// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Tooltip } from 'antd'
import React from 'react'

type IsEditedType = {
  edited?: boolean
  updatedAtTime?: React.ReactNode
}

const IsEdited: React.FC<IsEditedType> = ({ edited, updatedAtTime }) => {
  return <Tooltip title={updatedAtTime}>{edited && <div className='mx-1'>• Edited</div>}</Tooltip>
}

export default IsEdited
