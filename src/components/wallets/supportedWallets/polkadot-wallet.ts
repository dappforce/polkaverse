import { BaseDotsamaWallet } from '../base-wallet'

export class PolkadotjsWallet extends BaseDotsamaWallet {
  extensionName = 'polkadot-js'
  title = 'Polkadot.js'
  noExtensionMessage = ''
  installUrls = {
    Chrome:
      'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd/related',
    Firefox:
      'https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search',
  }
  logo = {
    src: '/images/wallets/PolkadotjsLogo.svg',
    alt: 'Polkadotjs Logo',
  }
}
