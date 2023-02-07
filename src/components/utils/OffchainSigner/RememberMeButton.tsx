import Button from 'antd/lib/button'
import React from 'react'
import { TxButtonProps } from 'src/components/substrate/SubstrateTxButton'

import { SubmittableResult } from '@polkadot/api'

import axios, { AxiosRequestConfig } from 'axios'
import { offchainSignerRequest } from './OffchainSignerUtils'

import type { Signer } from '@polkadot/api/types'
import { VoidFn } from '@polkadot/api/types'
import { isFunction, stringToHex } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { getCurrentWallet } from 'src/components/auth/utils'
import { useResponsiveSize } from 'src/components/responsive'
import { useSubstrate } from 'src/components/substrate'
import useToggle from 'src/components/substrate/useToggle'
import { getWalletBySource } from 'src/components/wallets/supportedWallets'
import messages from 'src/messages'
import store from 'store'
import styles from '../../substrate/SubstrateTxButton.module.sass'
import { controlledMessage, Message, showErrorMessage, showSuccessMessage } from '../Message'
const log = newLogger('RememberMeButton')

export type TxCallback = (status: SubmittableResult) => void
export type TxFailedCallback = (status: SubmittableResult | null) => void

const PROXY_ADDRESS = 'ProxyAddress'
const setProxyAddress = (proxyAddress: string) => store.set(PROXY_ADDRESS, proxyAddress)

const OFFCHAIN_TOKEN = 'OffchainToken'
const setOffchainToken = (offchainToken: string) => store.set(OFFCHAIN_TOKEN, offchainToken)

function RememberMeButton({
  label,
  disabled,
  loading,
  onClick,
  onSuccess,
  successMessage,
  onFailed,
  failedMessage,
  withSpinner,
  component,
  ...antdProps
}: TxButtonProps) {
  const { api } = useSubstrate()
  const [isSending, , setIsSending] = useToggle(false)
  const [isConfirming, , setIsConfirming] = useToggle(false)
  const { isMobile } = useResponsiveSize()
  const myAddress = useMyAddress()

  const waitMessage = controlledMessage({
    message: messages.waitingForTx,
    type: 'info',
    duration: 0,
    className: isMobile ? styles.NotificationProgressMobile : styles.NotificationProgress,
  })

  let unsub: VoidFn | undefined

  const buttonLabel = label || 'Remember me'
  const Component = component || Button

  if (!api || !api.isReady) {
    return (
      <Component {...antdProps} disabled={true}>
        {buttonLabel}
      </Component>
    )
  }

  const unsubscribe = () => {
    if (unsub) {
      waitMessage.close()
      unsub()
    }
  }

  const doOnSuccess: TxCallback = result => {
    isFunction(onSuccess) && onSuccess(result)

    const message: Message = isFunction(successMessage) ? successMessage(result) : successMessage

    message && showSuccessMessage(message)
  }

  const doOnFailed: TxFailedCallback = result => {
    isFunction(onFailed) && onFailed(result)

    const message: Message = isFunction(failedMessage) ? failedMessage(result) : failedMessage

    message && showErrorMessage(message)
  }

  const onSuccessHandler = async (result: SubmittableResult) => {
    if (!result || !result.status) {
      return
    }

    const { status } = result
    if (status.isFinalized || status.isInBlock) {
      setIsSending(false)
      await unsubscribe()

      const blockHash = status.isFinalized ? status.asFinalized : status.asInBlock

      log.debug(`✅ Tx finalized. Block hash: ${blockHash.toString()}`)

      result.events
        .filter(({ event: { section } }): boolean => section === 'system')
        .forEach(({ event: { method } }): void => {
          if (method === 'ExtrinsicSuccess') {
            doOnSuccess(result)
          } else if (method === 'ExtrinsicFailed') {
            doOnFailed(result)
          }
        })
    } else if (result.isError || result.dispatchError || result.internalError) {
      doOnFailed(result)
    } else {
      log.debug(`⏱ Current tx status: ${status.type}`)
    }
  }

  const onFailedHandler = (err: Error) => {
    if (err) {
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
        throw new Error('Error when retrieving signed message')
      }

      // 2. send signed proof
      const dataSignature = await sendSignedMessage(signedMessageJwt, messageJwt)

      const { accessToken } = dataSignature

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

      const proxyAddress = await fetchProxyAddress()
      setProxyAddress(proxyAddress)

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

      // 4. open up extension and sign addProxy call
      const extrinsic = await api.tx.proxy.addProxy(proxyAddress, null, 0)

      const tx = await extrinsic.signAsync(myAddress, { signer })

      unsub = await tx.send(onSuccessHandler)
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
      return
    }
  }

  const confirmOffchainSigner = async () => {
    unsubscribe()

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
      loading={(withSpinner && isSending) || loading}
    >
      {buttonLabel}
    </Component>
  )
}

export default React.memo(RememberMeButton)
