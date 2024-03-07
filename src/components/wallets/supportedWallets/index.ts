import { getWallets, Wallet } from '@talismn/connect-wallets'

export const supportedWallets = getWallets()

export const getWalletBySource = (source: string | unknown): Wallet | undefined => {
  if (typeof source !== 'string') return undefined
  return getWallets().find(wallet => {
    return wallet.title.toLowerCase() === source.toLowerCase()
  })
}

export const isWalletInstalled = (source: string | unknown): boolean => {
  const wallet = getWalletBySource(source)
  return wallet?.installed as boolean
}
