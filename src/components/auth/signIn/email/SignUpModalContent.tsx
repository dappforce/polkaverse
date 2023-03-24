import HCaptcha from '@hcaptcha/react-hcaptcha'
import { Keyring } from '@polkadot/api'
import { stringToU8a, u8aToHex } from '@polkadot/util'
import { isStr, toSubsocialAddress } from '@subsocial/utils'
import { Button, Form, Input } from 'antd'
import clsx from 'clsx'
import jwtDecode from 'jwt-decode'
import { RuleObject } from 'rc-field-form/lib/interface'
import { useEffect, useRef, useState } from 'react'
import { MutedDiv } from 'src/components/utils/MutedText'
import {
  emailSignUp,
  getErrorMessage,
  JwtPayload,
  requestProof,
  resendEmailConfirmation,
} from 'src/components/utils/OffchainSigner/api/requests'
import {
  SIGNER_REFRESH_TOKEN_KEY,
  SIGNER_TOKEN_KEY,
  TEMP_REGISTER_ACCOUNT,
} from 'src/components/utils/OffchainSigner/ExternalStorage'
import useMnemonicGenerate from 'src/components/utils/OffchainSigner/useMnemonicGenerate'
import { hCaptchaSiteKey } from 'src/config/env'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { StepsEnum, useAuth } from '../../AuthContext'
import { EmailInput, PasswordInput } from './SignInModalContent'
import styles from './SignInModalContent.module.sass'
import useEncryptionToStorage from './useEncryptionToStorage'

type FormValues = {
  email: string
  password: string
  repeatPassword: string
}

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

type Props = {
  setCurrentStep: (step: number) => void
}

const SignUpModalContent = ({ setCurrentStep }: Props) => {
  const { mnemonic } = useMnemonicGenerate()
  const { createEncryptedAccountAndSave } = useEncryptionToStorage()
  const {
    state: { email },
    setMnemonic,
    setPassword,
    setEmail,
  } = useAuth()

  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [token, setToken] = useState<string | undefined>()
  const [captchaReady, setCaptchaReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const hCaptchaRef = useRef(null)

  const { setData: setSignerToken } = useExternalStorage(SIGNER_TOKEN_KEY)
  const { setData: setSignerRefreshToken } = useExternalStorage(SIGNER_REFRESH_TOKEN_KEY)
  const { setData: setTempRegisterAccount } = useExternalStorage(TEMP_REGISTER_ACCOUNT)

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
    try {
      const keyring = new Keyring({ type: 'sr25519' })
      const newPair = keyring.addFromUri(mnemonic)
      const accountAddress = newPair.address
      const { proof } = await requestProof(newPair.address)

      const message = stringToU8a(proof)
      const signedProof = newPair.sign(message)

      if (!token) throw new Error('hCaptcha token is not set')

      const { email, password } = values

      const props = {
        email,
        password,
        accountAddress,
        signedProof: u8aToHex(signedProof),
        proof,
        hcaptchaResponse: token,
      }

      const data = await emailSignUp(props)
      const { accessToken, refreshToken } = data

      const decoded = jwtDecode<JwtPayload>(accessToken)

      const { emailVerified } = decoded

      if (!emailVerified) {
        const data = await resendEmailConfirmation(accessToken)
        const { message } = data

        if (message === 'sent') {
          // save to local storage for usage in ConfirmationModal
          const subsocialAddress = toSubsocialAddress(accountAddress)
          setSignerToken(accessToken, subsocialAddress)
          setSignerRefreshToken(refreshToken, subsocialAddress)
          setTempRegisterAccount(subsocialAddress)

          // save secret to local storage (in case of page reload)
          createEncryptedAccountAndSave(mnemonic, password)

          // save to context (to be reused in ShowMnemonic)
          setMnemonic(mnemonic)
          setPassword(password)

          // email to be shown in ConfirmationModal
          setEmail(email)

          setCurrentStep(StepsEnum.Confirmation)
        }
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
    const isMatched = allValues.password === allValues.repeatPassword
    const isValid = isFilled && isValidEmail && isValidPassword && isMatched
    setIsFormValid(isValid)
  }

  const validateRepeatPassword = (_: RuleObject, value: RuleObject) => {
    if (value && value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Passwords do not match.'))
    }
    return Promise.resolve()
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

        <Form.Item
          name={fieldName('repeatPassword')}
          className={clsx(styles.BaseFormItem, isError && styles.BaseFormItemError)}
          validateTrigger='onBlur'
          rules={[{ validator: validateRepeatPassword }]}
        >
          <Input
            required
            type='password'
            onBlur={e => {
              form.validateFields(['repeatPassword'])
              form.setFieldsValue({ [fieldName('repeatPassword')]: e.target.value.trim() })
            }}
            placeholder='Repeat Password'
          />
        </Form.Item>

        <Button
          type='primary'
          size='large'
          htmlType='submit'
          loading={loading}
          disabled={!isFormValid || loading || !captchaReady}
          onClick={() => {
            setLoading(true)
            onLoad()
          }}
          block
        >
          Sign Up
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
            Already have an account?
            <Button
              className={styles.ButtonLinkDiv}
              type='link'
              onClick={() => setCurrentStep(StepsEnum.SignIn)}
            >
              Sign In
            </Button>
          </MutedDiv>
        </div>
      </div>
    </Form>
  )
}

export default SignUpModalContent
