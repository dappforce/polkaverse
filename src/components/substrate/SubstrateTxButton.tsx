import Button, { ButtonProps } from 'antd/lib/button'
import React from 'react'

import { ApiPromise, SubmittableResult } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types'
import { isFunction } from '@polkadot/util'

import type { Signer } from '@polkadot/api/types'
import { VoidFn } from '@polkadot/api/types'
import { isEmptyStr, newLogger } from '@subsocial/utils'
import { useCreateSendGaUserEvent } from 'src/ga'
import messages from 'src/messages'
import { useOpenCloseOnBoardingModal } from 'src/rtk/features/onBoarding/onBoardingHooks'
import { AnyAccountId } from 'src/types'
import { useSubstrate } from '.'
import { useAuth } from '../auth/AuthContext'
import { getCurrentWallet } from '../auth/utils'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { controlledMessage, Message, showErrorMessage, showSuccessMessage } from '../utils/Message'
import { getWalletBySource } from '../wallets/supportedWallets/index'
import styles from './SubstrateTxButton.module.sass'
import useToggle from './useToggle'
const log = newLogger('TxButton')

export type GetTxParamsFn = () => any[]
export type GetTxParamsAsyncFn = () => Promise<any[]>

export type TxCallback = (status: SubmittableResult) => void
export type TxFailedCallback = (status: SubmittableResult | null) => void

type SuccessMessageFn = (status: SubmittableResult) => Message
type FailedMessageFn = (status: SubmittableResult | null) => Message

type SuccessMessage = Message | SuccessMessageFn
type FailedMessage = Message | FailedMessageFn

export type BaseTxButtonProps = Omit<ButtonProps, 'onClick' | 'form'>

export type TxButtonProps = BaseTxButtonProps & {
  accountId?: AnyAccountId
  tx?: string
  params?: any[] | GetTxParamsFn | GetTxParamsAsyncFn
  label?: React.ReactNode
  title?: string
  unsigned?: boolean
  onValidate?: () => boolean | Promise<boolean>
  onClick?: () => void
  onSuccess?: TxCallback
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
    },
  } = useAuth()

  const api = customNodeApi || subsocialApi

  const sendGaEvent = useCreateSendGaUserEvent(`Create tx: ${tx}`)

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
    setIsSending(false)

    if (err) {
      const errMsg = `Tx failed: ${err.toString()}`
      log.debug(`❌ ${errMsg}`)
      showErrorMessage(errMsg)
    }

    doOnFailed(null)
  }

  const sendSignedTx = async () => {
    if (!accountId) {
      throw new Error('No account id provided')
    }

    let signer: Signer | undefined

    if (isMobile) {
      const { web3FromAddress } = await import('@polkadot/extension-dapp')
      signer = await (await web3FromAddress(accountId.toString())).signer
    } else {
      const currentWallet = getCurrentWallet()
      const wallet = getWalletBySource(currentWallet)
      signer = wallet?.signer
    }

    if (!signer) {
      throw new Error('No signer provided')
    }

    try {
      const extrinsic = await getExtrinsic()

      const tx = await extrinsic.signAsync(accountId, { signer })
      unsub = await tx.send(onSuccessHandler)
      waitMessage.open()
      sendGaEvent()
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
    if (unsub) {
      waitMessage.close()
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

    isFunction(onClick) && onClick()

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
