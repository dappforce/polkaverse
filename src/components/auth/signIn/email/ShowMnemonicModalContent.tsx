import { Keyring } from '@polkadot/api'
import { Button, Card, Checkbox, Divider } from 'antd'
import { useEffect, useState } from 'react'
import { Copy } from 'src/components/urls/helpers'
import CopyOutlinedIcon from 'src/components/utils/icons/CopyOutlined'
import useEncryptionToStorage from './useEncryptionToStorage'

import { useAuth } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'

type Props = {
  onRegisterDone: (address: string) => void
}

const ShowMnemonicModalContent = ({ onRegisterDone }: Props) => {
  const { state } = useAuth()
  const { mnemonic, password } = state

  const { createEncryptedAccountAndSave } = useEncryptionToStorage()

  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false)

  useEffect(() => {
    if (isMnemonicSaved && mnemonic && password) {
      createEncryptedAccountAndSave(mnemonic, password)
    }
  }, [isMnemonicSaved, mnemonic, password])

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
