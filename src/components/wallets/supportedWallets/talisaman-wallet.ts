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
