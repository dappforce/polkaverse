// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import config from 'src/config'
import MultiBanner from './MultiBanner'

const bannersKind = ['blue', 'white', 'pink']

const BANNER_STORAGE_KEY = 'df.banner'

export const DomainsBanner = () => (
  <MultiBanner
    uid={BANNER_STORAGE_KEY}
    kinds={bannersKind}
    href={`${config.appBaseUrl}/dd/register`}
    buildUrl={({ kind, isMobile }) =>
      `/images/banners/${kind}-domains${isMobile ? '-mobile' : ''}.png`
    }
  />
)

export default DomainsBanner
