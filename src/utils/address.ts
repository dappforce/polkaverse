// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { decodeAddress, encodeAddress as encodePolkadotAddress } from '@polkadot/keyring'
import { hexToU8a, isHex } from '@polkadot/util'

export function isValidAddress(address: string) {
  try {
    encodePolkadotAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}
