import { Button, Form } from 'antd'
import { useState } from 'react'
import AuthCode from 'react-auth-code-input'
import CountdownTimerButton from 'src/components/utils/OffchainSigner/CountdownTimerButton'
import {
  offchainSignerRequest,
  setAuthOnRequest,
} from 'src/components/utils/OffchainSigner/OffchainSignerUtils'
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

  const confirmEmail = async (code: string) => {
    try {
      const res = await offchainSignerRequest({
        method: 'POST',
        endpoint: 'auth/confirm-email',
        data: {
          code,
        },
      })

      if (!res) throw new Error('Something went wrong')

      return res.data
    } catch (error) {
      console.warn({ error })
    }
  }

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

        {
          //TODO: call api onclick
        }
        <CountdownTimerButton
          className={styles.ButtonLinkMedium}
          baseLabel='Resend code'
          type='link'
        />

        <Button type='primary' size='large' htmlType='submit' disabled={!isFormValid} block>
          Confirm
        </Button>
      </div>
    </Form>
  )
}

export default ConfirmationModalContent
