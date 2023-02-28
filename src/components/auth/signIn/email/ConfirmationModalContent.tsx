import { Button, Form } from 'antd'
import { useState } from 'react'
import AuthCode from 'react-auth-code-input'
import { StepsEnum } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'

type FormValues = {
  confirmationCode: number
}

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

type Props = {
  setCurrentStep: (step: number) => void
}

const ConfirmationModalContent = ({ setCurrentStep }: Props) => {
  const [, setResult] = useState<undefined | string>()
  const handleOnChange = (res: string) => {
    setResult(res)
  }

  return (
    <div className={styles.ConfirmationModalContent}>
      <Form.Item name={fieldName('confirmationCode')} className='mb-0' validateTrigger='onBlur'>
        <AuthCode
          allowedCharacters='numeric'
          onChange={handleOnChange}
          inputClassName={styles.InputOTP}
        />
      </Form.Item>

      <Button className='p-0 ml-1' type='link' onClick={() => console.log('resend code')}>
        Resend code
      </Button>

      <Button
        type='primary'
        size='large'
        onClick={() => setCurrentStep(StepsEnum.ShowMnemonic)}
        block
      >
        Confirm
      </Button>
    </div>
  )
}

export default ConfirmationModalContent
