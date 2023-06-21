// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { CloseOutlined } from '@ant-design/icons'
import Link from 'next/link'
import React, { useState } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import { isServerSide } from 'src/components/utils/index'
import store from 'store'
import styles from './index.module.sass'

type BuildUrlFnProps = {
  kind: string
  isMobile: boolean
}

type MultiBannerProps = {
  uid: string
  kinds: string[]
  buildUrl: (props: BuildUrlFnProps) => string
  href: string
}

export const MultiBanner = ({ uid, kinds, buildUrl, href }: MultiBannerProps) => {
  const { isMobile } = useResponsiveSize()

  const bannerFromStorage = store.get(uid)

  const [showBanner, setShowBanner] = useState(
    bannerFromStorage !== undefined ? bannerFromStorage : true,
  )

  if (isServerSide() || !showBanner) return null

  const kindIndex = new Date().getTime() % kinds.length
  const kind = kinds[kindIndex]

  const backgroundImage = buildUrl({ kind, isMobile })

  const closeBanner = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault()
    setShowBanner(false)
    store.set(uid, false)
  }

  const closeButton = <CloseOutlined className={styles.DfCloseButton} onClick={closeBanner} />

  return (
    <Link href={href}>
      <a target='_blank' rel='noreferrer'>
        <div
          className={styles.Banner}
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'left center',
          }}
        >
          {closeButton}
        </div>
      </a>
    </Link>
  )
}

export default MultiBanner
