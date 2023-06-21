// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { BaseDotsamaWallet } from '../base-wallet'

export class TalismanWallet extends BaseDotsamaWallet {
  extensionName = 'talisman'
  title = 'Talisman'
  installUrls = {
    Chrome: 'https://app.talisman.xyz/spiritkeys',
    Firefox: 'https://addons.mozilla.org/en-US/firefox/addon/talisman-wallet-extension/',
  }
  noExtensionMessage = ''
  logo = {
    src: '/images/wallets/TalismanLogo.svg',
    alt: 'Talisman Logo',
  }
}
