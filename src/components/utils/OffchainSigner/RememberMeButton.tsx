import Button from 'antd/lib/button'
import React from 'react'
import { TxButtonProps } from 'src/components/substrate/SubstrateTxButton'

import axios, { AxiosRequestConfig } from 'axios'
import { offchainSignerRequest } from './OffchainSignerUtils'

import type { Signer } from '@polkadot/api/types'
import { isFunction, stringToHex } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { getCurrentWallet } from 'src/components/auth/utils'
import { useResponsiveSize } from 'src/components/responsive'
import { useSubstrate } from 'src/components/substrate'
import useToggle from 'src/components/substrate/useToggle'
import { getWalletBySource } from 'src/components/wallets/supportedWallets'
import store from 'store'
import { showErrorMessage } from '../Message'
const log = newLogger('RememberMeButton')

const PROXY_ADDRESS = 'ProxyAddress'
export const setProxyAddress = (proxyAddress: string) => store.set(PROXY_ADDRESS, proxyAddress)
export const getProxyAddress = (): string => store.get(PROXY_ADDRESS)

const OFFCHAIN_ADDRESS = 'OffchainAddress'
export const setOffchainAddress = (offchainAddress: string) =>
  store.set(OFFCHAIN_ADDRESS, offchainAddress)
export const getOffchainAddress = (): string => store.get(OFFCHAIN_ADDRESS)

const OFFCHAIN_TOKEN = 'OffchainToken'
export const setOffchainToken = (offchainToken: string) => store.set(OFFCHAIN_TOKEN, offchainToken)
export const getOffchainToken = (): string => store.get(OFFCHAIN_TOKEN)

interface RememberMeButtonProps extends TxButtonProps {
  onFailedAuth: () => void
  onSuccessAuth: () => void
}

function RememberMeButton({
  label,
  disabled,
  loading,
  onClick,
  onSuccessAuth,
  onFailedAuth,
  withSpinner,
  component,
  ...antdProps
}: RememberMeButtonProps) {
  const { api } = useSubstrate()
  const [isConfirming, , setIsConfirming] = useToggle(false)
  const { isMobile } = useResponsiveSize()
  const myAddress = useMyAddress()

  const buttonLabel = label || 'Remember me'
  const Component = component || Button

  if (!api || !api.isReady) {
    return (
      <Component {...antdProps} disabled={true}>
        {buttonLabel}
      </Component>
    )
  }

  const onFailedHandler = (err: Error) => {
    if (err) {
      onFailedAuth()
      setIsConfirming(false)
      const errMsg = `Signing failed: ${err.toString()}`
      log.debug(`❌ ${errMsg}`)
      showErrorMessage(errMsg)
    }
  }

  const requestMessage = async () => {
    if (!myAddress) {
      throw new Error('No account id provided')
    }

    const data = {
      accountAddress: myAddress,
    }

    try {
      const res = await offchainSignerRequest({
        data,
        endpoint: 'auth/generateAuthByAddressProof',
        method: 'POST',
      })

      return res?.data
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
      return
    }
  }

  const signMessage = async (messageJwt: string): Promise<`0x${string}` | undefined> => {
    if (!myAddress) {
      throw new Error('No account id provided')
    }

    let signer: Signer | undefined

    if (isMobile) {
      const { web3FromAddress } = await import('@polkadot/extension-dapp')
      signer = await (await web3FromAddress(myAddress.toString())).signer
    } else {
      const currentWallet = getCurrentWallet()
      const wallet = getWalletBySource(currentWallet)
      signer = wallet?.signer
    }

    if (!signer) {
      throw new Error('No signer provided')
    }

    if (!signer?.signRaw) {
      throw new Error('signing failed!')
    }

    try {
      const { signature } = await signer.signRaw({
        address: myAddress as string,
        data: stringToHex(messageJwt),
        type: 'bytes',
      })

      return signature
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
      return
    }
  }

  const sendSignedMessage = async (signedMessageJwt: string, messageJwt: string) => {
    const data = {
      accountAddress: myAddress as string,
      signedMessageJwt,
      messageJwt,
    }

    try {
      const res = await offchainSignerRequest({
        data,
        endpoint: 'auth/authByAddress',
        method: 'POST',
      })

      return res?.data
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
      return
    }
  }

  const fetchProxyAddress = async () => {
    try {
      const res = await offchainSignerRequest({
        endpoint: 'signer/main-proxy-address',
        method: 'GET',
      })

      return res?.data
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
      return
    }
  }

  const finaliseOffchainSigner = async () => {
    if (!myAddress) {
      throw new Error('No account id provided')
    }

    try {
      // 1. request a proof
      const dataMessage = await requestMessage()
      const { jwt: messageJwt } = dataMessage

      // 1a. sign proof
      const signedMessageJwt = await signMessage(messageJwt)

      if (!signedMessageJwt) {
        console.warn('Error when retrieving signed message')
        return
      }

      // 2. send signed proof
      const dataSignature = await sendSignedMessage(signedMessageJwt, messageJwt)

      const { accessToken } = dataSignature

      setOffchainAddress(myAddress)
      setOffchainToken(accessToken)

      // 3. save access token in an axios instance from now on
      axios.interceptors.request.use(
        async (config: AxiosRequestConfig) => {
          config.headers = config.headers ?? {}

          config.headers.Authorization = accessToken

          return config
        },
        error => {
          return Promise.reject(error)
        },
      )

      // 3a. set accessToken in localStorage?

      const { address } = await fetchProxyAddress()
      setProxyAddress(address)

      onSuccessAuth()
      //   if (!myAddress) {
      //     throw new Error('No account id provided')
      //   }

      //   let signer: Signer | undefined

      //   if (isMobile) {
      //     const { web3FromAddress } = await import('@polkadot/extension-dapp')
      //     signer = await (await web3FromAddress(myAddress.toString())).signer
      //   } else {
      //     const currentWallet = getCurrentWallet()
      //     const wallet = getWalletBySource(currentWallet)
      //     signer = wallet?.signer
      //   }

      // 4. open up extension and sign addProxy call
      //   const extrinsic = await api.tx.proxy.addProxy(proxyAddress, null, 0)

      //   const tx = await extrinsic.signAsync(myAddress, { signer })

      //   unsub = await tx.send(onSuccessHandler)
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
      return
    }
  }

  const confirmOffchainSigner = async () => {
    isFunction(onClick) && onClick()

    setIsConfirming(true)
    finaliseOffchainSigner()
  }

  const isDisabled = disabled || isConfirming

  return (
    <Component
      {...antdProps}
      onClick={() => {
        confirmOffchainSigner()
      }}
      disabled={isDisabled}
      loading={(withSpinner && isConfirming) || loading}
    >
      {buttonLabel}
    </Component>
  )
}

export default React.memo(RememberMeButton)
