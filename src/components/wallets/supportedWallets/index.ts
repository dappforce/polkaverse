// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Wallet } from '../types'
import { PolkadotjsWallet } from './polkadot-wallet'
import { SubWallet } from './subwallet-wallet'
import { TalismanWallet } from './talisaman-wallet'

export const supportedWallets = [new TalismanWallet(), new SubWallet(), new PolkadotjsWallet()]

export const getWalletBySource = (source: string | unknown): Wallet | undefined => {
  return supportedWallets.find(wallet => {
    return wallet.extensionName === source
  })
}

export const isWalletInstalled = (source: string | unknown): boolean => {
  const wallet = getWalletBySource(source)
  return wallet?.installed as boolean
}
