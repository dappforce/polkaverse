import { Button, Form, Input } from 'antd'
import { RuleObject } from 'rc-field-form/lib/interface'
import { useState } from 'react'
import { MutedDiv } from 'src/components/utils/MutedText'
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

const SignUpModalContent = ({ setCurrentStep }: Props) => {
  const [form] = Form.useForm()

  const [isFormValid, setIsFormValid] = useState(false)

  const handleSubmit = (values: FormValues) => {
    console.log('form values:', values)
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
    <Form form={form} onValuesChange={handleValuesChange} onFinish={handleSubmit}>
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
          // onClick={() => setCurrentStep(StepsEnum.Confirmation)}
          block
        >
          Sign Up
        </Button>
        <div className='d-flex justify-content-center align-items-center'>
          <MutedDiv>
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
