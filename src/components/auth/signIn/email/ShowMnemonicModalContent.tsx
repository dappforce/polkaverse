import { SubmittableResult } from '@polkadot/api'
import { VoidFn } from '@polkadot/api/types'
import { isFunction } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'
import { Button, Card, Checkbox, Divider } from 'antd'
import { useEffect, useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useResponsiveSize } from 'src/components/responsive'
import { useSubstrate } from 'src/components/substrate'
import {
  FailedMessage,
  SuccessMessage,
  TxCallback,
  TxFailedCallback,
} from 'src/components/substrate/SubstrateTxButton'
import useToggle from 'src/components/substrate/useToggle'
import { Copy } from 'src/components/urls/helpers'
import CopyOutlinedIcon from 'src/components/utils/icons/CopyOutlined'
import {
  controlledMessage,
  Message,
  showErrorMessage,
  showSuccessMessage,
} from 'src/components/utils/Message'
import { fetchMainProxyAddress } from 'src/components/utils/OffchainSigner/api/requests'
import {
  getSignerRefreshToken,
  getSignerToken,
  getTempRegisterAccount,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import SignerKeyringManager from 'src/components/utils/OffchainSigner/SignerKeyringManager'
import messages from 'src/messages'
import notificationStyles from '../../../substrate/SubstrateTxButton.module.sass'
import { useAuth } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'
import useEncryptionToStorage from './useEncryptionToStorage'

const log = newLogger('MnemonicModalContent')

export const ESTIMATED_ENERGY_FOR_ONE_TX = 100_000_000

type Props = {
  onRegisterDone: (address: string, emailAddress: string) => void
  setLoading: (loading: boolean) => void
  successMessage?: SuccessMessage
  failedMessage?: FailedMessage
}

const signerKeyringManager = new SignerKeyringManager()

const ShowMnemonicModalContent = ({
  onRegisterDone,
  setLoading,
  failedMessage,
  successMessage,
}: Props) => {
  const { state } = useAuth()
  const { mnemonic, email, password } = state

  const { api } = useSubstrate()
  const { createEncryptedAccountAndSave, getEncryptedStoredAccount } = useEncryptionToStorage()
  const { isMobile } = useResponsiveSize()

  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false)
  const [isSending, , setIsSending] = useToggle(false)
  const [isAccountReady, setIsAccountReady] = useState(false)

  useEffect(() => {
    if (isMnemonicSaved && mnemonic && password) {
      createEncryptedAccountAndSave(mnemonic, password)
    }
  }, [isMnemonicSaved, mnemonic, password])

  const accountAddress = getTempRegisterAccount()
  const mnemonicToBeShown = mnemonic ?? getEncryptedStoredAccount(accountAddress!, password!)

  const userPair = signerKeyringManager.generateKeypairBySecret(mnemonicToBeShown)
  const userAddress = userPair.address

  useSubsocialEffect(
    ({ substrate }) => {
      if (!userAddress) return

      let unsubEnergy: VoidFn | undefined

      const subEnergy = async () => {
        const api = await substrate.api

        unsubEnergy = await api.query.energy.energyBalance(userAddress, energyAmount => {
          const energyBalance = parseFloat(energyAmount.toPrimitive().toString())
          if (energyBalance > ESTIMATED_ENERGY_FOR_ONE_TX) {
            setIsAccountReady(true)
          } else {
            setIsAccountReady(false)
          }
        })
      }

      subEnergy()

      return () => {
        unsubEnergy && unsubEnergy()
      }
    },
    [userAddress],
  )

  const waitMessage = controlledMessage({
    message: messages.waitingForTx,
    type: 'info',
    duration: 0,
    className: isMobile
      ? notificationStyles.NotificationProgressMobile
      : notificationStyles.NotificationProgress,
  })

  let unsub: VoidFn | undefined

  const unsubscribe = () => {
    if (unsub) {
      waitMessage.close()
      unsub()
    }
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

  const onSuccess = () => {
    setLoading(false)
    const userAddress = userPair?.address
    onRegisterDone(userAddress, email!)
  }

  const onFailed = () => {
    setLoading(false)
    const userAddress = userPair?.address
    onRegisterDone(userAddress, email!)
  }

  const handleRegisterDone = async () => {
    try {
      setLoading(true)
      const accessToken = getSignerToken(userAddress)
      const refreshToken = getSignerRefreshToken(userAddress)

      if (!accessToken || !refreshToken) {
        log.warn('No access token or refresh token')
        return
      }

      const data = await fetchMainProxyAddress(accessToken)
      const { address: mainProxyAddress } = data

      unsub = await api.tx.freeProxy
        .addFreeProxy(mainProxyAddress, 'SocialActions', 0)
        .signAndSend(userPair, onSuccessHandler)
    } catch (error) {
      log.warn({ error })
    }
  }

  return (
    <div className={styles.ConfirmationStepContent}>
      <Card className={styles.InnerCard}>
        <div className={styles.MnemonicText}>{mnemonicToBeShown}</div>
        <Divider type={'vertical'} className={styles.InnerDivider} />
        <Copy text={mnemonicToBeShown} message='Your mnemonic phrase copied'>
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
        disabled={!isMnemonicSaved || !isAccountReady}
        loading={isSending || !isAccountReady}
        onClick={handleRegisterDone}
        block
      >
        {!isAccountReady ? 'Preparing your account' : 'Continue'}
      </Button>
    </div>
  )
}

export default ShowMnemonicModalContent
