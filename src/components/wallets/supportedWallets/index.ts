import { Wallet } from '../types'
import { PolkadotjsWallet } from './polkadot-wallet'
import { SubWallet } from './subwallet-wallet'
import { TalismanWallet } from './talisaman-wallet'

export const supportedWallets = [new PolkadotjsWallet(), new TalismanWallet(), new SubWallet()]

export const getWalletBySource = (source: string | unknown): Wallet | undefined => {
  return supportedWallets.find(wallet => {
    return wallet.extensionName === source
  })
}

export const isWalletInstalled = (source: string | unknown): boolean => {
  const wallet = getWalletBySource(source)
  return wallet?.installed as boolean
}
