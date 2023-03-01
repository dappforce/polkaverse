import { Button, Card, Divider } from 'antd'
import { Copy } from 'src/components/urls/helpers'
import CopyOutlinedIcon from 'src/components/utils/icons/CopyOutlined'
import { StepsEnum } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'

type Props = {
  setCurrentStep: (step: number) => void
}

const ShowMnemonicModalContent = ({ setCurrentStep }: Props) => {
  const MNEMONIC = 'nurse type awful punch cat pool brain artefact entire sight adult silly'

  return (
    <div className={styles.ConfirmationStepContent}>
      <Card className={styles.InnerCard}>
        <div className={styles.MnemonicText}>{MNEMONIC}</div>
        <Divider type={'vertical'} className={styles.InnerDivider} />
        <Copy text={MNEMONIC} message='Your mnemonic phrase copied'>
          <div className={styles.CopyIcon}>
            <CopyOutlinedIcon />
          </div>
        </Copy>
      </Card>
      <Button
        type='primary'
        size='large'
        onClick={() => setCurrentStep(StepsEnum.SignInDone)}
        block
      >
        Continue
      </Button>
    </div>
  )
}

export default ShowMnemonicModalContent
