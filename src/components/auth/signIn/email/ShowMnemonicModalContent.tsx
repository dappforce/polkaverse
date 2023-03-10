import { Keyring } from '@polkadot/api'
import { Button, Card, Checkbox, Divider } from 'antd'
import { useEffect, useState } from 'react'
import { Copy } from 'src/components/urls/helpers'
import CopyOutlinedIcon from 'src/components/utils/icons/CopyOutlined'

import {
  NONCE,
  SALT,
  SALT_NONCE,
  SECRET_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { encryptKey, generateAccount } from 'src/utils/crypto'
import { useAuth } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'

type Props = {
  onRegisterDone: (address: string) => void
}

const ShowMnemonicModalContent = ({ onRegisterDone }: Props) => {
  const { state } = useAuth()
  const { mnemonic, password } = state
  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false)

  const { setData: setSecretKey } = useExternalStorage(SECRET_KEY)
  const { setData: setNonce } = useExternalStorage(NONCE)
  const { setData: setSalt } = useExternalStorage(SALT)
  const { setData: setSaltNonce } = useExternalStorage(SALT_NONCE)

  useEffect(() => {
    const createEncryptedAccountAndSave = async (mnemonic: string, password: string) => {
      const { secretKey, publicAddress } = await generateAccount(mnemonic)
      encryptAndSaveToStorage(secretKey, publicAddress, password)
    }

    if (isMnemonicSaved && mnemonic && password) {
      createEncryptedAccountAndSave(mnemonic, password)
    }
  }, [isMnemonicSaved, mnemonic, password])

  const encryptAndSaveToStorage = (secretKey: string, storageKey: string, password: string) => {
    const {
      encryptedMessage: encryptedSecretKey,
      nonceStr,
      encryptedSalt,
      saltNonce,
    } = encryptKey(secretKey, password)

    setSecretKey(encryptedSecretKey, storageKey)
    setNonce(nonceStr, storageKey)
    setSalt(encryptedSalt, storageKey)
    setSaltNonce(saltNonce, storageKey)
  }

  if (!mnemonic) return null

  const handleRegisterDone = () => {
    const keyring = new Keyring({ type: 'sr25519' })
    const { address } = keyring.addFromUri(mnemonic)
    onRegisterDone(address)
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
        disabled={!isMnemonicSaved}
        onClick={handleRegisterDone}
        block
      >
        Continue
      </Button>
    </div>
  )
}

export default ShowMnemonicModalContent
