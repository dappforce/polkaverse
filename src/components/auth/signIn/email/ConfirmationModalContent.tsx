import { Button, Form, Input } from 'antd'
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
  const [form] = Form.useForm()

  return (
    <div className={styles.SignInModalContent}>
      <Form.Item name={fieldName('confirmationCode')} className='mb-0' validateTrigger='onBlur'>
        <Input
          onBlur={e =>
            form.setFieldsValue({ [fieldName('confirmationCode')]: e.target.value.trim() })
          }
          placeholder='Email'
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
