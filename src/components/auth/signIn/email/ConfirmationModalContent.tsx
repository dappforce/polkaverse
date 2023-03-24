import { isStr } from '@subsocial/utils'
import { Button, Form } from 'antd'
import jwtDecode from 'jwt-decode'
import { useState } from 'react'
import AuthCode from 'react-auth-code-input'
import {
  confirmEmail,
  getErrorMessage,
  JwtPayload,
  resendEmailConfirmation,
} from 'src/components/utils/OffchainSigner/api/requests'
import CountdownTimerButton from 'src/components/utils/OffchainSigner/CountdownTimerButton'
import {
  getSignerToken,
  getTempRegisterAccount,
  SIGNER_REFRESH_TOKEN_KEY,
  SIGNER_TOKEN_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import { CODE_DIGIT } from 'src/config/ValidationsConfig'
import useExternalStorage from 'src/hooks/useExternalStorage'
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
  const { setData: setSignerToken } = useExternalStorage(SIGNER_TOKEN_KEY)
  const { setData: setSignerRefreshToken } = useExternalStorage(SIGNER_REFRESH_TOKEN_KEY)

  const userAddress = getTempRegisterAccount()

  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: FormValues) => {
    const accessToken = getSignerToken(userAddress!)
    if (!accessToken) throw new Error('Access token is not defined')

    try {
      const props = {
        code: values.confirmationCode.toString(),
        accessToken,
      }
      const data = await confirmEmail(props)

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data

      const { accountAddress } = jwtDecode<JwtPayload>(newAccessToken)

      // Save auth tokens to local storage for getMainProxyAddress request
      setSignerToken(newAccessToken, accountAddress)
      setSignerRefreshToken(newRefreshToken, accountAddress)

      setCurrentStep(StepsEnum.ShowMnemonic)
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage as string)
    }
  }

  const handleChange = (value: string) => {
    form.setFieldsValue({ [fieldName('confirmationCode')]: value })
  }

  const patternToMatch = new RegExp(`^[0-9]{${CODE_DIGIT}}$`)

  const handleValuesChange = (_: FormValues, allValues: FormValues) => {
    const isFilled = Object.values(allValues).every(value => Boolean(value))
    const isValidConfirmationCode = patternToMatch.test(allValues.confirmationCode.toString())
    const isValid = isFilled && isValidConfirmationCode
    setIsFormValid(isValid)
  }

  const handleResendCode = async () => {
    try {
      const accessToken = getSignerToken(userAddress!)

      if (!accessToken) throw new Error('Token is not defined')
      await resendEmailConfirmation(accessToken)
    } catch (error) {
      console.warn({ error })
    }
  }

  const isError = isStr(error)

  return (
    <Form form={form} onValuesChange={handleValuesChange} onFinish={handleSubmit}>
      <div className={styles.ConfirmationStepContent}>
        <Form.Item
          name={fieldName('confirmationCode')}
          className={styles.CodeFormItem}
          validateTrigger='onBlur'
          rules={[
            {
              pattern: patternToMatch,
              message: 'Please enter a valid confirmation code.',
            },
          ]}
          help={error}
          validateStatus={isError ? 'error' : undefined}
        >
          <AuthCode
            length={CODE_DIGIT}
            allowedCharacters='numeric'
            onChange={handleChange}
            inputClassName={isError ? styles.InputOTPError : styles.InputOTP}
          />
        </Form.Item>

        <CountdownTimerButton
          className={styles.ButtonLinkMedium}
          baseLabel='Resend code'
          type='link'
          onClick={handleResendCode}
        />

        <Button
          type='primary'
          size='large'
          htmlType='submit'
          disabled={!isFormValid || isError}
          block
        >
          Confirm
        </Button>
      </div>
    </Form>
  )
}

export default ConfirmationModalContent
