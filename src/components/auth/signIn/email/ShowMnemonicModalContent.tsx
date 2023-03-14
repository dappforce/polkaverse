import { Keyring, SubmittableResult } from '@polkadot/api'
import { VoidFn } from '@polkadot/api/types'
import { isFunction } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'
import { Button, Card, Checkbox, Divider } from 'antd'
import { useEffect, useState } from 'react'
import { useResponsiveSize } from 'src/components/responsive'
import { useSubstrate } from 'src/components/substrate'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import useToggle from 'src/components/substrate/useToggle'
import { Copy } from 'src/components/urls/helpers'
import CopyOutlinedIcon from 'src/components/utils/icons/CopyOutlined'
import {
  controlledMessage,
  Message,
  showErrorMessage,
  showSuccessMessage,
} from 'src/components/utils/Message'
import { getOffchainToken } from 'src/components/utils/OffchainSigner/ExternalStorage'
import messages from 'src/messages'
import { generateKeypairBySecret } from 'src/utils/crypto'
import { useAuth } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'
import useEncryptionToStorage from './useEncryptionToStorage'
import useOffchainSignerApi from './useOffchainSignerApi'

const log = newLogger('ShowMnemonicModalContent')

type Props = {
  onRegisterDone: (address: string) => void
}

const ShowMnemonicModalContent = ({ onRegisterDone }: Props) => {
  const { state } = useAuth()
  const { mnemonic, password } = state

  const { api } = useSubstrate()
  const { createEncryptedAccountAndSave } = useEncryptionToStorage()
  const { getMainProxyAddress } = useOffchainSignerApi()
  const { isMobile } = useResponsiveSize()

  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false)
  const [isSending, , setIsSending] = useToggle(false)

  const successMessage = 'Your account was successfully created'
  const failedMessage = 'Failed to create your account'

  useEffect(() => {
    if (isMnemonicSaved && mnemonic && password) {
      createEncryptedAccountAndSave(mnemonic, password)
    }
  }, [isMnemonicSaved, mnemonic, password])

  if (!mnemonic) return null

  const userPair = generateKeypairBySecret(mnemonic)

  const onSuccess = () => {
    const userAddress = userPair?.address
    onRegisterDone(userAddress)
  }

  const onFailed = () => {
    const userAddress = userPair?.address
    onRegisterDone(userAddress)
  }

  const doOnSuccess: TxCallback = result => {
    isFunction(onSuccess) && onSuccess()

    const message: Message = isFunction(successMessage) ? successMessage(result) : successMessage

    message && showSuccessMessage(message)
  }

  const doOnFailed: TxFailedCallback = result => {
    isFunction(onFailed) && onFailed()

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
      console.warn('result', { result })
      doOnFailed(result)
    } else {
      log.debug(`⏱ Current tx status: ${status.type}`)
    }
  }

  let unsub: VoidFn | undefined

  const waitMessage = controlledMessage({
    message: messages.waitingForTx,
    type: 'info',
    duration: 0,
    className: isMobile ? styles.NotificationProgressMobile : styles.NotificationProgress,
  })

  const unsubscribe = () => {
    if (unsub) {
      waitMessage.close()
      unsub()
    }
  }

  const handleRegisterDone = async () => {
    try {
      const keyring = new Keyring({ type: 'sr25519' })
      const userPair = keyring.addFromUri(mnemonic)
      const userAddress = userPair.address

      const accessToken = getOffchainToken(userAddress)
      const refreshToken = getOffchainToken(userAddress)
      if (!accessToken || !refreshToken)
        throw new Error('Access token or refresh token is not defined')

      const data = await getMainProxyAddress({ accessToken, refreshToken })
      const { address: mainProxyAddress } = data

      // TODO: check after free proxy is available
      unsub = await api.tx.proxy
        .addProxy(mainProxyAddress, 'Any', 0)
        .signAndSend(userPair, onSuccessHandler)
    } catch (error) {
      console.warn({ error })
    }
  }

  return (
    <div className={styles.ConfirmationStepContent}>
      <Card className={styles.InnerCard}>
        <div className={styles.MnemonicText}>{mnemonic}</div>
        <Divider type={'vertical'} className={styles.InnerDivider} />
        <Copy text={mnemonic} message='Your mnemonic phrase copied'>
          <div className={styles.CopyIcon}>
            <CopyOutlinedIcon />
          </div>
        </Copy>
      </Card>
      <Checkbox className='align-self-start' onChange={e => setIsMnemonicSaved(e.target.checked)}>
        I have saved my mnemonic
      </Checkbox>
      <Button
        type='primary'
        size='large'
        disabled={!isMnemonicSaved || !api || !api.isReady}
        loading={isSending}
        onClick={handleRegisterDone}
        block
      >
        Continue
      </Button>
    </div>
  )
}

export default ShowMnemonicModalContent
