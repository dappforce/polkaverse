import HCaptcha from '@hcaptcha/react-hcaptcha'
import { Keyring } from '@polkadot/api'
import { stringToU8a, u8aToHex } from '@polkadot/util'
import { Button, Form, Input } from 'antd'
import { RuleObject } from 'rc-field-form/lib/interface'
import { useEffect, useRef, useState } from 'react'
import { MutedDiv } from 'src/components/utils/MutedText'
import {
  offchainSignerRequest,
  setAuthOnRequest,
} from 'src/components/utils/OffchainSigner/OffchainSignerUtils'
import useMnemonicGenerate from 'src/components/utils/OffchainSigner/useMnemonicGenerate'
import { hCaptchaSiteKey } from 'src/config/env'
import { StepsEnum } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'

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

type EmailSignUpProps = {
  email: string
  password: string
  accountAddress: string
  signedProof: string
  proof: string
  hcaptchaResponse: string
}

const SignUpModalContent = ({ setCurrentStep }: Props) => {
  const { mnemonic } = useMnemonicGenerate()

  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)

  const [token, setToken] = useState<string | undefined>()
  const [, setCaptchaReady] = useState(false)
  const hCaptchaRef = useRef(null)

  const onExpire = () => {
    console.warn('hCaptcha Token Expired')
  }

  const onError = (err: any) => {
    console.warn(`hCaptcha Error: ${err}`)
  }

  const onLoad = () => {
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
      //TODO: add logic for sending token to /signUp endpoint (backend)
      // if success, then go to confirmation step
      // setCurrentStep(StepsEnum.Confirmation)
      handleSubmit(form.getFieldsValue(), token)
      // setCurrentStep(StepsEnum.Confirmation)
      handleSubmit(form.getFieldsValue(), token)
    }
  }, [token])

  const requestProof = async (accountAddress: string) => {
    try {
      const res = await offchainSignerRequest({
        method: 'POST',
        endpoint: 'auth/generate-address-verification-proof',
        data: { accountAddress },
      })

      if (!res) throw new Error('Something went wrong')

      return res.data
    } catch (error) {
      console.warn({ error })
    }
  }

  const emailSignUp = async (props: EmailSignUpProps) => {
    try {
      const res = await offchainSignerRequest({
        method: 'POST',
        endpoint: 'auth/email-sign-up',
        data: props,
      })
      if (!res) throw new Error('Something went wrong')

      return res.data
    } catch (error) {
      console.warn({ error })
    }
  }

  const handleSubmit = async (values: FormValues, token: string) => {
    try {
      const keyring = new Keyring({ type: 'sr25519' })
      const newPair = keyring.addFromUri(mnemonic)
      const { proof } = await requestProof(newPair.address)

      // construct the proof
      const message = stringToU8a(proof)
      const signedProof = newPair.sign(message)
      const isValid = newPair.verify(message, signedProof, newPair.publicKey)
      console.log({ isValid })

      if (!token) throw new Error('hCaptcha token is not set')

      const props = {
        email: values.email,
        password: values.password,
        accountAddress: newPair.address,
        signedProof: u8aToHex(signedProof),
        proof,
        hcaptchaResponse: token,
      }

      const data = await emailSignUp(props)
      const { accessToken, refreshToken } = data
      setAuthOnRequest({ accessToken, refreshToken })

      setCurrentStep(StepsEnum.Confirmation)
    } catch (error) {
      console.warn({ error })
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

  return (
    <Form form={form} onValuesChange={handleValuesChange}>
      <div className={styles.SignInModalContent}>
        <Form.Item
          name={fieldName('email')}
          className='mb-0'
          validateTrigger='onBlur'
          rules={[{ pattern: /\S+@\S+\.\S+/, message: 'Please enter a valid email address.' }]}
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

        <Form.Item
          name={fieldName('password')}
          className='mb-0'
          validateTrigger='onBlur'
          rules={[
            {
              min: 8,
              pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
              message:
                'Your password should contain at least 8 characters, with at least one letter and one number.',
            },
          ]}
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

        <Form.Item
          name={fieldName('repeatPassword')}
          className='mb-0'
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
          disabled={!isFormValid}
          onClick={() => {
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
