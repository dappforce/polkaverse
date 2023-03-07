import { Button, Card, Checkbox, Divider } from 'antd'
import { useState } from 'react'
import { Copy } from 'src/components/urls/helpers'
import CopyOutlinedIcon from 'src/components/utils/icons/CopyOutlined'
import useMnemonicGenerate from 'src/components/utils/OffchainSigner/useMnemonicGenerate'
import { StepsEnum } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'

type Props = {
  setCurrentStep: (step: number) => void
}

const ShowMnemonicModalContent = ({ setCurrentStep }: Props) => {
  //TODO: only shown once (during sign up flow)
  const { mnemonic } = useMnemonicGenerate()
  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false)

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
        onClick={() => setCurrentStep(StepsEnum.SignInDone)}
        block
      >
        Continue
      </Button>
    </div>
  )
}

export default ShowMnemonicModalContent
