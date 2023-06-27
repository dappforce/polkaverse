import HCaptcha from '@hcaptcha/react-hcaptcha'
import { isStr, newLogger } from '@subsocial/utils'
import { Button, Form, FormInstance, Input } from 'antd'
import clsx from 'clsx'
import jwtDecode from 'jwt-decode'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MutedDiv } from 'src/components/utils/MutedText'
import {
  emailSignIn,
  JwtPayload,
  onErrorHandler,
} from 'src/components/utils/OffchainSigner/api/requests'
import { setAuthOnRequest } from 'src/components/utils/OffchainSigner/api/utils'
import { hCaptchaSiteKey } from 'src/config/env'
import { VALIDATION_DELAY } from 'src/config/ValidationsConfig'
import useSignerExternalStorage from 'src/hooks/useSignerExternalStorage'
import { debounceFunction } from 'src/utils/async'
import { StepsEnum, useAuth } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'
import { RegexValidations, useFormValidation } from './useFormValidation'

const log = newLogger('SignInModalContent')

type FormValues = {
  email: string
  password: string
}

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

type Props = {
  setCurrentStep: (step: number) => void
  onSignInSuccess: (address: string, emailAddress: string) => void
}

type InputProps = {
  error: string | null
  isError: boolean
  form: FormInstance<FormValues>
  data?: string
}

export const EmailInput = ({ data, error, isError, form }: InputProps) => {
  const validateEmail = () => {
    form.validateFields(['email'])
  }
  const debouncedValidateField = useCallback(debounceFunction(validateEmail, VALIDATION_DELAY), [])

  const handleAfterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldsValue({ [fieldName('email')]: e.target.value.trim() })
    debouncedValidateField()
  }

  return (
    <Form.Item
      initialValue={data}
      name={fieldName('email')}
      className={clsx(styles.BaseFormItem, isError && styles.BaseFormItemError)}
      rules={[
        {
          pattern: RegexValidations.ValidEmail,
          message: 'Please enter a valid email address.',
          validateTrigger: ['onBlur'],
        },
      ]}
      validateStatus={isStr(error) ? 'error' : undefined}
    >
      <Input
        autoFocus
        required
        type='email'
        placeholder='Email'
        onChange={handleAfterInput}
        onBlur={handleAfterInput}
      />
    </Form.Item>
  )
}

export const PasswordInput = ({ error, isError, form }: InputProps) => {
  const validatePassword = () => {
    form.validateFields(['password'])
  }
  const debouncedValidateField = useCallback(
    debounceFunction(validatePassword, VALIDATION_DELAY),
    [],
  )

  const handleAfterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldsValue({ [fieldName('password')]: e.target.value.trim() })
    debouncedValidateField()
  }

  return (
    <Form.Item
      name={fieldName('password')}
      className={clsx(styles.BaseFormItem, isError && styles.BaseFormItemError)}
      rules={[
        {
          min: 8,
          pattern: RegexValidations.ValidPassword,
          message:
            'Your password should contain at least 8 characters, with at least one letter and one number.',
          validateTrigger: ['onBlur'],
        },
      ]}
      help={error}
      validateStatus={isStr(error) ? 'error' : undefined}
    >
      <Input
        required
        type='password'
        placeholder='Password'
        onChange={handleAfterInput}
        onBlur={handleAfterInput}
      />
    </Form.Item>
  )
}

const SignInModalContent = ({ setCurrentStep, onSignInSuccess }: Props) => {
  const {
    state: { email },
    setEmail,
    setPassword,
  } = useAuth()

  const { isValidEmail, isValidPassword } = useFormValidation()

  const { setSignerTokensByAddress } = useSignerExternalStorage()

  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [token, setToken] = useState<string | undefined>()
  const [captchaReady, setCaptchaReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const hCaptchaRef = useRef(null)

  const onExpire = () => {
    setError('hCaptcha Token Expired')
  }

  const onError = (err: any) => {
    setError(`hCaptcha Error: ${err}`)
  }

  const loadCaptcha = () => {
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

      if (!data) log.error('No data returned from emailSignIn')
      const { accessToken, refreshToken } = data

      setAuthOnRequest(accessToken as string)

      const decoded = jwtDecode<JwtPayload>(accessToken)
      const { emailVerified, accountAddress } = decoded

      // Save auth tokens to local storage for future use in the app
      setSignerTokensByAddress({
        userAddress: accountAddress,
        token: accessToken,
        refreshToken,
      })

      if (!emailVerified) {
        setCurrentStep(StepsEnum.Confirmation)
      } else {
        onSignInSuccess(accountAddress, email)
      }

      // for decryption
      setPassword(password)
    } catch (error) {
      setLoading(false)
      onErrorHandler(error, setError, true)
    }
  }

  const handleValuesChange = (_: FormValues, allValues: FormValues) => {
    const isFilled = Object.values(allValues).every(value => Boolean(value))
    const isEmailValid = isValidEmail(allValues.email)
    const isPasswordValid = isValidPassword(allValues.password)
    const isValid = isFilled && isEmailValid && isPasswordValid
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
          loading={loading}
          disabled={!isFormValid || loading || !captchaReady}
          onClick={() => {
            setLoading(true)
            loadCaptcha()
          }}
          block
        >
          Log In
          <HCaptcha
            size='invisible'
            sitekey={hCaptchaSiteKey}
            onVerify={token => {
              setToken(token)
            }}
            onLoad={() => {
              setCaptchaReady(true)
            }}
            onClose={() => {
              setLoading(false)
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
