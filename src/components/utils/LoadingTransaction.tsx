// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import clsx from 'clsx'
import { HTMLProps } from 'react'
import { MutedSpan } from './MutedText'

export default function LoadingTransaction({ className, ...props }: HTMLProps<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'd-flex flex-column',
        'align-items-center justify-content-center',
        'mt-5 mb-5',
        className,
      )}
      {...props}
    >
      <img className='on-boarding-image' src='/loading.gif' />
      <MutedSpan className='mt-3'>It may take up to 24 seconds</MutedSpan>
    </div>
  )
}
