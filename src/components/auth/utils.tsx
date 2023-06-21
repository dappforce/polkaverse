// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { InjectedAccountWithMeta, InjectedWindow } from '@polkadot/extension-inject/types'
import { isEmptyArray } from '@subsocial/utils'
import config from 'src/config'
import store from 'store'
import { getWalletBySource } from '../wallets/supportedWallets/index'
import { Status } from './MyAccountsContext'

export const recheckStatuses = ['UNAVAILABLE', 'UNAUTHORIZED']

const { appName } = config

export const CURRENT_WALLET = 'CurrentWalletName'

export const getCurrentWallet = (): string => store.get(CURRENT_WALLET)

export const setCurrentWallet = (currentWallet: string) => store.set(CURRENT_WALLET, currentWallet)

export type Account = {
  // name contains the user-defined name of the account
  name?: string
  type?: string
  address: string
}

export type ConnectWalletProps = {
  setAccounts: (accounts: InjectedAccountWithMeta[]) => void
  setStatus: (status: Status) => void
  signOut?: () => void
}

export const mobileWalletConection = ({ setStatus, setAccounts }: ConnectWalletProps) => {
  let unsub: Function | null = null
  let cancelled = false

  ;(async () => {
    const { isWeb3Injected, web3Enable, web3AccountsSubscribe } = await import(
      '@polkadot/extension-dapp'
    )
    const injectedExtensions = await web3Enable(appName)

    if (!isWeb3Injected) {
      if (!cancelled) setStatus('UNAVAILABLE')
      return
    }

    if (!injectedExtensions.length) {
      if (!cancelled) setStatus('UNAUTHORIZED')
      return
    }

    if (cancelled) return

    unsub = await web3AccountsSubscribe(accounts => {
      if (!isEmptyArray(accounts)) {
        setAccounts(accounts)
      }

      setStatus(accounts.length < 1 ? 'NOACCOUNT' : 'OK')
    })

    if (cancelled) unsub()
  })()

  return () => {
    cancelled = true
    unsub && unsub()
  }
}

export const desktopWalletConnect = ({ setAccounts, setStatus }: ConnectWalletProps) => {
  let unsub: any = null
  let cancelled = false

  ;(async () => {
    const currentWallet = getCurrentWallet() || 'polkadot-js'
    const wallet = getWalletBySource(currentWallet as string)

    if ((window as Window & InjectedWindow)?.injectedWeb3) {
      try {
        await wallet?.enable(appName)
        setCurrentWallet(currentWallet)
      } catch (err) {
        console.error(err)
      }
    }

    const extension = wallet?.extension

    if (!wallet?.installed) {
      if (!cancelled) setStatus('UNAVAILABLE')
      return
    }

    if (!extension) {
      if (!cancelled) setStatus('UNAUTHORIZED')
      return
    }

    if (cancelled) return

    unsub = await wallet.subscribeAccounts(accounts => {
      if (cancelled) return

      if (accounts) {
        setAccountsToState(accounts, setAccounts)
        setStatus(accounts.length < 1 ? 'NOACCOUNT' : 'OK')
      }
    })

    if (cancelled) unsub?.()
  })()

  return () => {
    cancelled = true
    unsub && unsub()
  }
}

export const setAccountsToState = (
  accounts: Account[],
  setAccounts: (accounts: InjectedAccountWithMeta[]) => void,
) => {
  if (!isEmptyArray(accounts)) {
    const addressesWithMeta = accounts.map(account => {
      return {
        meta: { name: account.name },
        ...account,
      }
    })

    setAccounts(addressesWithMeta as InjectedAccountWithMeta[])
  }
}
