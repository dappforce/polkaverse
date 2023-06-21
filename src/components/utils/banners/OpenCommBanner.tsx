// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import MultiBanner from './MultiBanner'

const bannersKind = ['robot', 'polka']

const BANNER_STORAGE_KEY = 'df.opencomm-banner'

const href = 'https://kusama.subsquare.io/referenda/referendum/198'

export const OpenCommBanner = () => (
  <MultiBanner
    uid={BANNER_STORAGE_KEY}
    kinds={bannersKind}
    href={href}
    buildUrl={({ kind, isMobile }) =>
      `/images/banners/${kind}-opencomm${isMobile ? '-mobile' : ''}.png`
    }
  />
)

export default OpenCommBanner
