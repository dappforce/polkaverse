// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { BaseDotsamaWallet } from '../base-wallet'

export class SubWallet extends BaseDotsamaWallet {
  extensionName = 'subwallet-js'
  title = 'SubWallet'
  installUrls = {
    Chrome:
      'https://chrome.google.com/webstore/detail/subwallet/onhogfjeacnfoofkfgppdlbmlmnplgbn?hl=en&authuser=0',
    Firefox: 'https://addons.mozilla.org/en-US/firefox/addon/subwallet/',
  }
  noExtensionMessage = ''
  logo = {
    src: '/images/wallets/SubWalletLogo.svg',
    alt: 'Subwallet Logo',
  }
}
