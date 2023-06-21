// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Banner } from '../banner/Banner'

type ClaimSpaceBannerProps = {
  title: string
  desc?: string
}

export const ClaimSpaceBanner = ({ title, desc }: ClaimSpaceBannerProps) => {
  return (
    <Banner
      uid='Claim Space (2021-06-10)'
      desktopImg='/images/desktop-claim-space.jpg'
      mobileImg='/images/mobile-claim-space.jpg'
      title={title}
      desc={desc}
      color='#fff'
      fontSize='1.2rem'
      textAlign='start'
      targetLink='/spaces/claim'
    />
  )
}
