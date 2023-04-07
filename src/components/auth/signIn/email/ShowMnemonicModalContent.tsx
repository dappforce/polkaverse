import { Button, Card, Checkbox, Divider } from 'antd'
import { useEffect, useState } from 'react'
import { useSubstrate } from 'src/components/substrate'
import useToggle from 'src/components/substrate/useToggle'
import { Copy } from 'src/components/urls/helpers'
import CopyOutlinedIcon from 'src/components/utils/icons/CopyOutlined'
import {
  getSignerRefreshToken,
  getSignerToken,
  getTempRegisterAccount,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import SignerKeyringManager from 'src/components/utils/OffchainSigner/SignerKeyringManager'
import { useAuth } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'
import useEncryptionToStorage from './useEncryptionToStorage'

type Props = {
  onRegisterDone: (address: string, emailAddress: string) => void
}

const signerKeyringManager = new SignerKeyringManager()

const ShowMnemonicModalContent = ({ onRegisterDone }: Props) => {
  const { state } = useAuth()
  const { mnemonic, email, password } = state

  const { api } = useSubstrate()
  const { createEncryptedAccountAndSave, getEncryptedStoredAccount } = useEncryptionToStorage()

  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false)
  const [isSending, ,] = useToggle(false)

  useEffect(() => {
    if (isMnemonicSaved && mnemonic && password) {
      createEncryptedAccountAndSave(mnemonic, password)
    }
  }, [isMnemonicSaved, mnemonic, password])

  const accountAddress = getTempRegisterAccount()
  const mnemonicToBeShown = mnemonic ?? getEncryptedStoredAccount(accountAddress!, password!)

  const handleRegisterDone = () => {
    try {
      const userPair = signerKeyringManager.generateKeypairBySecret(mnemonicToBeShown)
      const userAddress = userPair.address

      const accessToken = getSignerToken(userAddress)
      const refreshToken = getSignerRefreshToken(userAddress)

      if (!accessToken || !refreshToken)
        throw new Error('Access token or refresh token is not defined')

      onRegisterDone(userAddress, email!)
    } catch (error) {
      console.warn({ error })
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
