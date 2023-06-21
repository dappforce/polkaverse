// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { GenericAccountId } from '@polkadot/types'
import registry from '@subsocial/api/utils/registry'
import { isEmptyStr } from '@subsocial/utils'

export const isAccountId = (address: string) => {
  if (isEmptyStr(address)) return false

  try {
    return !!new GenericAccountId(registry, address)
  } catch {
    return false
  }
}
