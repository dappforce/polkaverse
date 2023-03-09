import { Button, Form } from 'antd'
import { useState } from 'react'
import AuthCode from 'react-auth-code-input'
import CountdownTimerButton from 'src/components/utils/OffchainSigner/CountdownTimerButton'
import { setAuthOnRequest } from 'src/components/utils/OffchainSigner/OffchainSignerUtils'
import { StepsEnum } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'
import useOffchainSignerApi from './useOffchainSignerApi'

type FormValues = {
  confirmationCode: number
}

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

type Props = {
  setCurrentStep: (step: number) => void
}

const ConfirmationModalContent = ({ setCurrentStep }: Props) => {
  const { confirmEmail, resendEmailConfirmation, emailConfirmationPayload } = useOffchainSignerApi()

  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)

  const handleSubmit = async (values: FormValues) => {
    try {
      const data = await confirmEmail(values.confirmationCode.toString())
      const { accessToken, refreshToken } = data
      setAuthOnRequest({ accessToken, refreshToken })

      setCurrentStep(StepsEnum.ShowMnemonic)
    } catch (error) {
      console.warn({ error })
    }
  }

  const handleChange = (value: string) => {
    form.setFieldsValue({ [fieldName('confirmationCode')]: value })
  }

  const handleValuesChange = (_: FormValues, allValues: FormValues) => {
    const isFilled = Object.values(allValues).every(value => Boolean(value))
    const isValidConfirmationCode = /^[0-9]{8}$/.test(allValues.confirmationCode.toString())
    const isValid = isFilled && isValidConfirmationCode
    setIsFormValid(isValid)
  }

  const handleResendCode = async () => {
    try {
      if (!emailConfirmationPayload) return

      await resendEmailConfirmation(emailConfirmationPayload)
    } catch (error) {
      console.warn({ error })
    }
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
              pattern: /^[0-9]{8}$/,
              message: 'Please enter a valid confirmation code.',
            },
          ]}
        >
          <AuthCode
            length={8}
            allowedCharacters='numeric'
            onChange={handleChange}
            inputClassName={styles.InputOTP}
          />
        </Form.Item>

        <CountdownTimerButton
          className={styles.ButtonLinkMedium}
          baseLabel='Resend code'
          type='link'
          onClick={handleResendCode}
        />

        <Button type='primary' size='large' htmlType='submit' disabled={!isFormValid} block>
          Confirm
        </Button>
      </div>
    </Form>
  )
}

export default ConfirmationModalContent
