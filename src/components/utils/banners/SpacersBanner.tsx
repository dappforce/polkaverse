// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import MultiBanner from './MultiBanner'

export const SpacersBanner = () => (
  <MultiBanner
    uid={'df.spacers-banner'}
    kinds={[]}
    href={'https://pods.spacers.app'}
    buildUrl={({ isMobile }) =>
      `/images/banners/${isMobile ? 'spacers-mobile' : 'spacers-desktop'}.jpg`
    }
  />
)

export default SpacersBanner
