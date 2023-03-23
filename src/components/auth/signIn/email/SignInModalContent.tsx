import HCaptcha from '@hcaptcha/react-hcaptcha'
import { isStr } from '@subsocial/utils'
import { Button, Form, FormInstance, Input } from 'antd'
import clsx from 'clsx'
import jwtDecode from 'jwt-decode'
import { useEffect, useRef, useState } from 'react'
import { MutedDiv } from 'src/components/utils/MutedText'
import {
  emailSignIn,
  getErrorMessage,
  JwtPayload,
  resendEmailConfirmation,
} from 'src/components/utils/OffchainSigner/api/requests'
import { setAuthOnRequest } from 'src/components/utils/OffchainSigner/api/utils'
import {
  OFFCHAIN_REFRESH_TOKEN_KEY,
  OFFCHAIN_TOKEN_KEY,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import { hCaptchaSiteKey } from 'src/config/env'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { StepsEnum, useAuth } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'

type FormValues = {
  email: string
  password: string
}

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

type Props = {
  setCurrentStep: (step: number) => void
  onSignInSuccess: (address: string) => void
}

type InputProps = {
  error: string | null
  isError: boolean
  form: FormInstance<FormValues>
  data?: string
}

export const EmailInput = ({ data, error, isError, form }: InputProps) => {
  return (
    <Form.Item
      initialValue={data}
      name={fieldName('email')}
      className={clsx(styles.BaseFormItem, isError && styles.BaseFormItemError)}
      validateTrigger='onBlur'
      rules={[{ pattern: /\S+@\S+\.\S+/, message: 'Please enter a valid email address.' }]}
      validateStatus={isStr(error) ? 'error' : undefined}
    >
      <Input
        required
        type='email'
        placeholder='Email'
        onBlur={e => {
          form.validateFields(['email'])
          form.setFieldsValue({ [fieldName('email')]: e.target.value.trim() })
        }}
      />
    </Form.Item>
  )
}

export const PasswordInput = ({ error, isError, form }: InputProps) => {
  return (
    <Form.Item
      name={fieldName('password')}
      className={clsx(styles.BaseFormItem, isError && styles.BaseFormItemError)}
      validateTrigger='onBlur'
      rules={[
        {
          min: 8,
          pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
          message:
            'Your password should contain at least 8 characters, with at least one letter and one number.',
        },
      ]}
      help={error}
      validateStatus={isStr(error) ? 'error' : undefined}
    >
      <Input
        required
        type='password'
        onBlur={e => {
          form.validateFields(['password'])
          form.setFieldsValue({ [fieldName('password')]: e.target.value.trim() })
        }}
        placeholder='Password'
      />
    </Form.Item>
  )
}

const SignInModalContent = ({ setCurrentStep, onSignInSuccess }: Props) => {
  const {
    state: { email },
    setEmail,
  } = useAuth()

  const { setData: setOffchainToken } = useExternalStorage(OFFCHAIN_TOKEN_KEY)
  const { setData: setOffchainRefreshToken } = useExternalStorage(OFFCHAIN_REFRESH_TOKEN_KEY)

  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [token, setToken] = useState<string | undefined>()
  const [captchaReady, setCaptchaReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const hCaptchaRef = useRef(null)

  const onExpire = () => {
    console.warn('hCaptcha Token Expired')
  }

  const onError = (err: any) => {
    console.warn(`hCaptcha Error: ${err}`)
  }

  const onLoad = () => {
    setLoading(false)
    // this reaches out to the hCaptcha JS API and runs the
    // execute function on it. you can use other functions as
    // documented here:
    // https://docs.hcaptcha.com/configuration#jsapi
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    hCaptchaRef.current?.execute()
  }

  useEffect(() => {
    setCaptchaReady(true)
  }, [])

  useEffect(() => {
    if (token) {
      handleSubmit(form.getFieldsValue(), token)
    }
  }, [token])

  const handleSubmit = async (values: FormValues, token: string) => {
    const { email, password } = values
    try {
      const props = {
        email,
        password,
        hcaptchaResponse: token,
      }

      const data = await emailSignIn(props)

      const { accessToken, refreshToken } = data

      const decoded = jwtDecode<JwtPayload>(accessToken)

      const { emailVerified, accountAddress } = decoded

      if (!emailVerified) {
        const data = await resendEmailConfirmation(accessToken)
        const { message } = data
        if (message === 'sent') setCurrentStep(StepsEnum.Confirmation)
      } else {
        setAuthOnRequest(accessToken)
        onSignInSuccess(accountAddress)

        // Save auth tokens to local storage for future use in the app
        setOffchainToken(accessToken, accountAddress)
        setOffchainRefreshToken(refreshToken, accountAddress)
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage as string)
    }
  }

  const handleValuesChange = (_: FormValues, allValues: FormValues) => {
    const isFilled = Object.values(allValues).every(value => Boolean(value))
    const isValidEmail = /\S+@\S+\.\S+/.test(allValues.email)
    const isValidPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(allValues.password)
    const isValid = isFilled && isValidEmail && isValidPassword
    setIsFormValid(isValid)
  }

  const handleCreateAccount = () => {
    let tempEmail = form.getFieldValue('email')
    if (tempEmail && tempEmail.length > 0) setEmail(tempEmail)

    setCurrentStep(StepsEnum.SignUp)
  }

  const isError = isStr(error)

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
      <div className={styles.SignInModalContent}>
        <EmailInput
          data={email ?? form.getFieldValue('email')}
          error={error}
          isError={isError}
          form={form}
        />

        <PasswordInput error={error} isError={isError} form={form} />

        <Button
          type='primary'
          size='large'
          htmlType='submit'
          disabled={!isFormValid || loading || !captchaReady}
          onClick={() => {
            setLoading(true)
            onLoad()
          }}
          block
        >
          Log In
          <HCaptcha
            size='invisible'
            sitekey={hCaptchaSiteKey}
            onVerify={setToken}
            onLoad={() => {
              setCaptchaReady(true)
            }}
            onError={onError}
            onExpire={onExpire}
            ref={hCaptchaRef}
          />
        </Button>
        <div className='d-flex justify-content-center align-items-center'>
          <MutedDiv className='font-weight-normal FontNormal'>
            New user?
            <Button className={styles.ButtonLinkDiv} type='link' onClick={handleCreateAccount}>
              Create account
            </Button>
          </MutedDiv>
        </div>
      </div>
    </Form>
  )
}

export default SignInModalContent
