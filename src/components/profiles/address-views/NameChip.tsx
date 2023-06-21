// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Tooltip } from 'antd'
import clsx from 'clsx'
import styles from './NameChip.module.sass'

export default function NameChip({ ...props }) {
  return (
    <div className='ml-auto'>
      <Tooltip
        className='ml-2'
        placement='bottomRight'
        title={
          <>
            <div>This account</div>
            <div>is registered with</div>
            <div>email</div>
          </>
        }
      >
        <div {...props} className={clsx(styles.Chip)} />
      </Tooltip>
    </div>
  )
}
