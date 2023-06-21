// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import memoize from 'lodash/memoize'
import { CID } from 'multiformats'
import config from 'src/config'

/** Memoized resolver of IPFS CID to a full URL. */
export const resolveIpfsUrl = memoize((cidOrUrl: string) => {
  try {
    if (CID.parse(cidOrUrl)) {
      return `${config.ipfsNodeUrl}/ipfs/${cidOrUrl}`
    }
  } catch (err) {
    // It's OK
  }

  // Looks like CID is already a resolved URL.
  return cidOrUrl
})
