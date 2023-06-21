// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import clsx from 'clsx'
import QRCodeStyling from 'qr-code-styling'
import { HTMLProps, useEffect, useRef, useState } from 'react'
import { Loading } from '../utils'
import styling from './qr-styling.json'
import styles from './SubsocialQrCode.module.sass'

export interface SubsocialQrCodeProps extends HTMLProps<HTMLDivElement> {
  url: string
  loading?: boolean
  size?: number
}

export default function SubsocialQrCode({ url, loading, size, ...props }: SubsocialQrCodeProps) {
  const qrCodeRef = useRef<HTMLDivElement | null>(null)

  if (size) {
    styling.width = size
    styling.height = size
  }

  const [qrCode] = useState(new QRCodeStyling(styling as any))

  useEffect(() => {
    qrCode.append(qrCodeRef.current as any)
  }, [])

  useEffect(() => {
    qrCode.update({
      data: url,
    })
  }, [url])

  return (
    <div {...props}>
      <div className={clsx(styles.SubsocialQrCode, loading && styles.Loading)} ref={qrCodeRef} />
      {loading && (
        <div style={{ width: styling.width, height: styling.height, fontSize: '100px' }}>
          <Loading />
        </div>
      )}
    </div>
  )
}
