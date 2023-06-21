// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { ApiPromise } from '@polkadot/api'
import { useLazyConnection } from '../lazy-connection/LazyConnectionContext'

export type State = {
  api?: ApiPromise
  hasKusamaConnection: boolean
  ksmDecimals: number
  ksmToken: string
}

export const defaultKsmDecimals = 12
export const defaultKsmSymbol = 'KSM'

export const useKusamaContext = (): State => {
  const api = useLazyConnection('kusama')

  return {
    hasKusamaConnection: !!api?.isConnected,
    ksmDecimals: api?.registry.chainDecimals[0] || 12,
    ksmToken: api?.registry.chainTokens[0] || 'KSM',
    api,
  }
}
