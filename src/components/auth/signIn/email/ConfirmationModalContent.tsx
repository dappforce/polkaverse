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
  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)

  const handleSubmit = (values: FormValues) => {
    console.log('form values:', values)
  }

  const handleChange = (value: string) => {
    form.setFieldsValue({ [fieldName('confirmationCode')]: value })
  }

  const handleValuesChange = (_: FormValues, allValues: FormValues) => {
    const isFilled = Object.values(allValues).every(value => Boolean(value))
    const isValidConfirmationCode = /^[0-9]{6}$/.test(allValues.confirmationCode.toString())
    const isValid = isFilled && isValidConfirmationCode
    setIsFormValid(isValid)
  }

  return (
    <Form form={form} onValuesChange={handleValuesChange} onFinish={handleSubmit}>
      <div className={styles.ConfirmationStepContent}>
        <Form.Item
          name={fieldName('confirmationCode')}
          className='mb-0'
          validateTrigger='onBlur'
          rules={[
            {
              pattern: /^[0-9]{6}$/,
              message: 'Please enter a valid confirmation code.',
            },
          ]}
        >
          <AuthCode
            allowedCharacters='numeric'
            onChange={handleChange}
            inputClassName={styles.InputOTP}
          />
        </Form.Item>

        <Button
          className={styles.ButtonLinkMedium}
          type='link'
          onClick={() => console.log('resend code')}
        >
          Resend code
        </Button>

        <Button
          type='primary'
          size='large'
          htmlType='submit'
          disabled={!isFormValid}
          onClick={() => setCurrentStep(StepsEnum.ShowMnemonic)}
          block
        >
          Confirm
        </Button>
      </div>
    </Form>
  )
}

export default ConfirmationModalContent
