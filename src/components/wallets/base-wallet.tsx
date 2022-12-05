// https://github.com/TalismanSociety/talisman-connect/blob/master/libs/wallets/src/lib/base-dotsama-wallet/index.ts

import type { Signer as InjectedSigner } from '@polkadot/api/types'
import {
  InjectedAccount,
  InjectedExtension,
  InjectedWindow,
} from '@polkadot/extension-inject/types'
import { showWarnMessage } from '../utils/Message'
import { SubscriptionFn, Wallet, WalletAccount } from './types'

export class BaseDotsamaWallet implements Wallet {
  extensionName = ''
  title = ''
  installUrls = {
    Chrome: '',
    Firefox: '',
  }
  logo = {
    src: '',
    alt: '',
  }

  _enabled: boolean | undefined
  _extension: InjectedExtension | undefined
  _signer: InjectedSigner | undefined
  _isLockedForSite: boolean | undefined = false

  get extension() {
    return this._extension
  }

  get signer() {
    return this._signer
  }

  get installed() {
    const injectedWindow = window as Window & InjectedWindow
    const injectedExtension = injectedWindow?.injectedWeb3?.[this.extensionName]

    return !!injectedExtension
  }

  get enabled() {
    return this._enabled
  }

  get rawExtension() {
    const injectedWindow = window as Window & InjectedWindow
    const injectedExtension = injectedWindow?.injectedWeb3?.[this.extensionName]
    return injectedExtension
  }

  enable = async (dappName: string) => {
    if (!dappName) {
      throw new Error('MissingParamsError: Dapp name is required.')
    }
    if (!this.installed) {
      throw new Error(`Refresh the browser if ${this.title} is already installed.`)
    }
    try {
      const injectedExtension = this.rawExtension
      const rawExtension = await injectedExtension?.enable(dappName)
      if (!rawExtension) {
        throw new Error(
          `${this.title} is installed but is not returned by the 'Wallet.enable(dappname)' function`,
        )
      }

      const extension: InjectedExtension = {
        ...rawExtension,
        name: this.extensionName,
        version: injectedExtension.version,
      }

      this._extension = extension
      this._signer = extension?.signer
      this._enabled = true
      this._isLockedForSite = false
    } catch (err) {
      if (!this._isLockedForSite) {
        showWarnMessage(<div>{`${err}`.replace('Error:', '')}</div>)
      }

      this._enabled = false
      this._isLockedForSite = true
    }
  }

  getAccounts = async (anyType?: boolean): Promise<WalletAccount[]> => {
    if (!this._extension) {
      throw new Error('The "Wallet.enable(dappname)" function should be called first.')
    }
    const accounts = await this._extension.accounts.get(anyType)
    const accountsWithWallet = accounts.map(account => {
      return {
        ...account,
        source: this._extension?.name as string,
        wallet: this,
        signer: this._extension?.signer,
      }
    })

    return accountsWithWallet
  }

  subscribeAccounts = async (callback: SubscriptionFn) => {
    if (!this._extension) {
      throw new Error('The "Wallet.enable(dappname)" function should be called first.')
    }
    const unsubscribe = this._extension.accounts.subscribe((accounts: InjectedAccount[]) => {
      const accountsWithWallet = accounts.map(account => {
        return {
          ...account,
          source: this._extension?.name as string,
          // Added extra fields here for convenience
          wallet: this,
          signer: this._extension?.signer,
        }
      })
      callback(accountsWithWallet)
    })

    return unsubscribe
  }
}
