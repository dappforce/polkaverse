import { getWallets, Wallet } from '@talismn/connect-wallets'

export const supportedWallets = getWallets()

export const getWalletBySource = (source: string | unknown): Wallet | undefined => {
  return getWallets().find(wallet => {
    return wallet.title === source
  })
}

export const isWalletInstalled = (source: string | unknown): boolean => {
  const wallet = getWalletBySource(source)
  return wallet?.installed as boolean
}
