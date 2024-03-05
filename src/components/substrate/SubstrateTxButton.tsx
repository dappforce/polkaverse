import { Keyring } from '@polkadot/api'
import { isStr } from '@subsocial/utils'
import Button, { ButtonProps } from 'antd/lib/button'
import React, { useMemo } from 'react'
import config from 'src/config'
import { useIsProxyAddedContext } from '../onboarding/contexts/IsProxyAdded'
import { isProxyAdded } from '../utils/OffchainSigner/ExternalStorage'
import { sendSignerTx } from '../utils/OffchainSigner/OffchainSignerUtils'

import { ApiPromise, SubmittableResult } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { isFunction } from '@polkadot/util'

import type { Signer } from '@polkadot/api/types'
import { VoidFn } from '@polkadot/api/types'
import { isEmptyStr, newLogger } from '@subsocial/utils'
import useExternalStorage from 'src/hooks/useExternalStorage'
import useSignerExternalStorage from 'src/hooks/useSignerExternalStorage'
import messages from 'src/messages'
import { useBuildSendEvent } from 'src/providers/AnalyticContext'
import { useOpenCloseOnBoardingModal } from 'src/rtk/features/onBoarding/onBoardingHooks'
import { useMyAccount } from 'src/stores/my-account'
import { AnyAccountId } from 'src/types'
import { KeyringSigner } from 'src/utils/account'
import { useSubstrate } from '.'
import { useAuth } from '../auth/AuthContext'
import { useMyAddress, useMyEmailAddress } from '../auth/MyAccountsContext'
import useEncryptedStorage from '../auth/signIn/email/useEncryptionToStorage'
import { getCurrentWallet } from '../auth/utils'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { controlledMessage, Message, showErrorMessage, showSuccessMessage } from '../utils/Message'
import {
  getSignerRefreshToken,
  getSignerToken,
  SIGNER_REFRESH_TOKEN_KEY,
  SIGNER_TOKEN_KEY,
} from '../utils/OffchainSigner/ExternalStorage'
import { getWalletBySource } from '../wallets/supportedWallets'
import styles from './SubstrateTxButton.module.sass'
import useToggle from './useToggle'
const log = newLogger('TxButton')

const { appName } = config

export type GetTxParamsFn = () => any[]
export type GetTxParamsAsyncFn = () => Promise<any[]>

export type TxCallback = (status: SubmittableResult) => void
export type TxFailedCallback = (status: SubmittableResult | null) => void

type SuccessMessageFn = (status: SubmittableResult) => Message
type FailedMessageFn = (status: SubmittableResult | null) => Message

export type SuccessMessage = Message | SuccessMessageFn
export type FailedMessage = Message | FailedMessageFn

export type BaseTxButtonProps = Omit<ButtonProps, 'onClick' | 'form'>

export type TxButtonProps = BaseTxButtonProps & {
  canUseProxy?: boolean
  accountId?: AnyAccountId
  tx?: string
  params?: any[] | GetTxParamsFn | GetTxParamsAsyncFn
  label?: React.ReactNode
  title?: string
  unsigned?: boolean
  onValidate?: () => boolean | Promise<boolean>
  onClick?: () => Promise<any | undefined> | void
  onSuccess?: TxCallback
  onCancel?: () => void
  isFreeTx?: boolean
  onFailed?: TxFailedCallback
  successMessage?: SuccessMessage
  failedMessage?: FailedMessage
  withSpinner?: boolean
  component?: React.FunctionComponent
  customNodeApi?: ApiPromise
}

function TxButton({
  accountId,
  tx,
  params,
  label,
  disabled,
  loading,
  unsigned,
  onValidate,
  onClick,
  onSuccess,
  onFailed,
  onCancel,
  isFreeTx = false,
  successMessage,
  failedMessage,
  withSpinner = true,
  component,
  children,
  customNodeApi,
  ...antdProps
}: TxButtonProps) {
  const { api: subsocialApi } = useSubstrate()
  const openOnBoardingModal = useOpenCloseOnBoardingModal()
  const [isSending, , setIsSending] = useToggle(false)

  const { isMobile } = useResponsiveSize()
  const {
    openSignInModal,
    state: {
      completedSteps: { hasTokens },
      password,
    },
  } = useAuth()

  const { data: signerToken } = useExternalStorage(SIGNER_TOKEN_KEY, {
    storageKeyType: 'user',
  })
  const { data: refreshToken } = useExternalStorage(SIGNER_REFRESH_TOKEN_KEY, {
    storageKeyType: 'user',
  })

  const { setIsSignerAddress, setSignerProxyAdded } = useSignerExternalStorage()

  const myAddress = useMyAddress()
  const { getEncryptedStoredAccount } = useEncryptedStorage()
  const { isProxyAdded: isProxyAddedState } = useIsProxyAddedContext()

  const myEmailAddress = useMyEmailAddress()

  const isProxySet = useMemo(() => {
    if (isProxyAddedState) return true
    return false
  }, [isProxyAddedState])

  const emailSignerToken = getSignerToken(accountId as string)
  const emailRefreshToken = getSignerRefreshToken(accountId as string)
  const isSigningWithEmail = isStr(emailSignerToken) && isStr(myEmailAddress)
  const isCurrentAddressAddedWithProxy =
    (isProxyAdded(myAddress!) || isProxySet) && isProxyAddedState
  const isSigningWithSignerAccount =
    isStr(signerToken) && !isStr(myEmailAddress) && isCurrentAddressAddedWithProxy

  const currentUserSignerToken = isSigningWithEmail ? emailSignerToken : signerToken
  const currentUserRefreshToken = isSigningWithEmail ? emailRefreshToken : refreshToken

  const isBatchTxUsingEmail = tx === 'utility.batch' && isStr(myEmailAddress)
  const isRemovingProxyOnAccount =
    tx === 'proxy.removeProxies' && isStr(myAddress) && isCurrentAddressAddedWithProxy
  const isAddingProxyOnAccount =
    tx === 'freeProxy.addFreeProxy' && isStr(myAddress) && !isCurrentAddressAddedWithProxy

  const isRemovingProxyUsingExtension = isSigningWithSignerAccount && isRemovingProxyOnAccount
  const isAddingProxyUsingExtension = !isSigningWithSignerAccount && isAddingProxyOnAccount

  const api = customNodeApi || subsocialApi

  const sendTxEvent = useBuildSendEvent('create_tx')

  const waitMessage = controlledMessage({
    message: messages.waitingForTx,
    type: 'info',
    duration: 0,
    className: isMobile ? styles.NotificationProgressMobile : styles.NotificationProgress,
  })

  let unsub: VoidFn | undefined

  const buttonLabel = label || children
  const Component = component || Button

  if (!api || !api.isReady) {
    return (
      <Component {...antdProps} disabled={true}>
        {buttonLabel}
      </Component>
    )
  }

  const allowedPalletsForSocialActions = [
    'posts',
    'reactions',
    'accountFollows',
    'spaceFollows',
    'spaces',
    'profiles',
  ]

  const [pallet, _] = (tx || '').split('.')
  const isSigningAllowedPallets = allowedPalletsForSocialActions.includes(pallet)

  const getExtrinsic = async (): Promise<SubmittableExtrinsic> => {
    const [pallet, method] = (tx || '').split('.')

    if (!api.tx[pallet]) {
      throw new Error(`Unable to find api.tx.${pallet}`)
    } else if (!api.tx[pallet][method]) {
      throw new Error(`Unable to find api.tx.${pallet}.${method}`)
    }

    let resultParams = (params || []) as any[]
    if (isFunction(params)) {
      resultParams = await params()
    }

    return api.tx[pallet][method](...resultParams)
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
      unsubscribe()

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
    setIsSending(false)

    if (err) {
      const errMsg = `Tx failed: ${err.toString()}`
      log.debug(`❌ ${errMsg}`)

      if (errMsg.includes('Cancelled')) {
        onCancel?.()
      }

      showErrorMessage(errMsg)
    }

    waitMessage.close()

    doOnFailed(null)
  }

  const sendSignerTxWithMessage = (extrinsic: SubmittableExtrinsic) => {
    sendSignerTx(
      api,
      extrinsic,
      currentUserSignerToken!,
      currentUserRefreshToken!,
      onSuccessHandler,
      onFailedHandler,
    )
    waitMessage.open()
    sendTxEvent({ tx })
  }

  const signWithExtension = async (
    extrinsic: SubmittableExtrinsic,
    accountId: AnyAccountId,
    hideRememberMePopup: boolean,
  ) => {
    let signer: Signer | undefined
    let tx: SubmittableExtrinsic
    let account: AnyAccountId | KeyringSigner = accountId

    try {
      if (accountId === useMyAccount.getState().address) {
        // use proxy signer
        signer = undefined
        const keypairSigner = useMyAccount.getState().signer
        if (!keypairSigner) throw new Error('No account signer provided')
        account = keypairSigner
      } else {
        // use extension signer
        if (isMobile) {
          const { web3Enable, web3FromAddress } = await import('@polkadot/extension-dapp')
          const extensions = await web3Enable(appName)

          if (extensions.length === 0) {
            return
          }
          signer = await (await web3FromAddress(accountId.toString())).signer
        } else {
          const currentWallet = getCurrentWallet()
          const wallet = getWalletBySource(currentWallet)
          signer = wallet?.signer
        }

        if (!signer) {
          throw new Error('No signer provided')
        }
      }

      tx = await extrinsic.signAsync(account as any, { signer, nonce: -1 })

      if (hideRememberMePopup) {
        setSignerProxyAdded('enabled', accountId as string)
        setIsSignerAddress(accountId as string)
      }
      unsub = await tx.send(onSuccessHandler)

      waitMessage.open()
      sendTxEvent({ tx })
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
    }
  }

  const sendSignedTx = async () => {
    if (!accountId) {
      throw new Error('No account id provided')
    }

    let hideRememberMePopup = false
    if ((tx === 'utility.batch' && signerToken) || tx === 'freeProxy.addFreeProxy')
      hideRememberMePopup = true

    try {
      let tx: SubmittableExtrinsic
      const extrinsic = await getExtrinsic()

      if (
        !isSigningWithEmail &&
        (isRemovingProxyUsingExtension || isAddingProxyUsingExtension || !isSigningAllowedPallets)
      ) {
        await signWithExtension(extrinsic, accountId, hideRememberMePopup)
        return
      }

      if (isSigningWithEmail) {
        if (isBatchTxUsingEmail) {
          const privateKey = getEncryptedStoredAccount(myAddress!, password!)
          const keyring = new Keyring({ type: 'sr25519' })
          const keyringPair = keyring.addFromUri(privateKey, {}, 'sr25519')
          tx = await extrinsic.signAsync(keyringPair)
          unsub = await tx.send(onSuccessHandler)
        } else {
          sendSignerTxWithMessage(extrinsic)
        }
        return
      }

      if (isSigningWithSignerAccount && isSigningAllowedPallets) {
        sendSignerTxWithMessage(extrinsic)
      } else {
        await signWithExtension(extrinsic, accountId, hideRememberMePopup)
      }
    } catch (err: any) {
      onFailedHandler(err instanceof Error ? err.message : err)
    }
  }

  const sendUnsignedTx = async () => {
    const extrinsic = await getExtrinsic()

    try {
      unsub = await extrinsic.send(onSuccessHandler)
      waitMessage.open()
    } catch (err: any) {
      onFailedHandler(err)
    }
  }

  const unsubscribe = () => {
    waitMessage.close()
    if (unsub) {
      unsub()
    }
  }

  // TODO can optimize this fn by wrapping it with useCallback. See TxButton from Apps.
  const sendTx = async () => {
    unsubscribe()

    if (isFunction(onValidate) && !(await onValidate())) {
      log.warn('Cannot send a tx because onValidate() returned false')
      return
    }

    const preventTransaction = await onClick?.()

    if (preventTransaction === true && preventTransaction !== undefined) return

    const txType = unsigned ? 'unsigned' : 'signed'
    log.debug(`Sending ${txType} tx...`)

    setIsSending(true)

    if (unsigned) {
      sendUnsignedTx()
    } else {
      sendSignedTx()
    }
  }

  const isDisabled = disabled || isSending || isEmptyStr(tx)

  return (
    <Component
      {...antdProps}
      onClick={() => {
        if (!customNodeApi && !isFreeTx) {
          if (!accountId) {
            openSignInModal(false)
            return setIsSending(false)
          }
          if (!hasTokens) {
            // TODO: create independent energy modal
            openOnBoardingModal('open', { toStep: 'energy', type: 'partial' })
            return setIsSending(false)
          }
        }

        sendTx()
      }}
      disabled={isDisabled || isSending}
      loading={(withSpinner && isSending) || loading}
    >
      {buttonLabel}
    </Component>
  )
}

export default React.memo(TxButton)
