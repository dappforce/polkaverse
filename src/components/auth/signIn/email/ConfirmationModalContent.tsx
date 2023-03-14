import { Button, Form } from 'antd'
import jwtDecode from 'jwt-decode'
import { useState } from 'react'
import AuthCode from 'react-auth-code-input'
import CountdownTimerButton from 'src/components/utils/OffchainSigner/CountdownTimerButton'
import {
  getOffchainToken,
  OFFCHAIN_REFRESH_TOKEN_KEY,
  OFFCHAIN_TOKEN_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { generateKeypairBySecret } from 'src/utils/crypto'
import { StepsEnum, useAuth } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'
import useOffchainSignerApi, { JwtPayload } from './useOffchainSignerApi'

type FormValues = {
  confirmationCode: number
}

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

type Props = {
  setCurrentStep: (step: number) => void
}

const ConfirmationModalContent = ({ setCurrentStep }: Props) => {
  const { confirmEmail, resendEmailConfirmation } = useOffchainSignerApi()
  const { state } = useAuth()
  const { mnemonic } = state

  const { setData: setOffchainToken } = useExternalStorage(OFFCHAIN_TOKEN_KEY)
  const { setData: setOffchainRefreshToken } = useExternalStorage(OFFCHAIN_REFRESH_TOKEN_KEY)

  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)

  if (!mnemonic) return null
  const { address: userAddress } = generateKeypairBySecret(mnemonic)

  const handleSubmit = async (values: FormValues) => {
    const accessToken = getOffchainToken(userAddress)
    const refreshToken = getOffchainToken(userAddress)

    try {
      const data = await confirmEmail(values.confirmationCode.toString(), accessToken, refreshToken)

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data

      const { accountAddress } = jwtDecode<JwtPayload>(newAccessToken)

      if (!accountAddress) throw new Error('Account address is not defined')

      // Save auth tokens to local storage for getMainProxyAddress request
      setOffchainToken(newAccessToken, accountAddress)
      setOffchainRefreshToken(newRefreshToken, accountAddress)

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
      const offchainToken = getOffchainToken(userAddress)
      const refreshToken = getOffchainToken(userAddress)

      if (!offchainToken || !refreshToken) throw new Error('Tokens are not defined')
      await resendEmailConfirmation({
        accessToken: offchainToken,
        refreshToken,
      })
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
