import { Button, Form, Input } from 'antd'
import { MutedDiv } from 'src/components/utils/MutedText'
import { StepsEnum } from '../../AuthContext'
import styles from './SignInModalContent.module.sass'

type FormValues = {
  email: string
  password: string
  passwordConfirm: string
}

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

type Props = {
  setCurrentStep: (step: number) => void
}

const SignUpModalContent = ({ setCurrentStep }: Props) => {
  const [form] = Form.useForm()

  return (
    <div className={styles.SignInModalContent}>
      <Form.Item name={fieldName('email')} className='mb-0' validateTrigger='onBlur'>
        <Input
          onBlur={e => form.setFieldsValue({ [fieldName('email')]: e.target.value.trim() })}
          placeholder='Email'
        />
      </Form.Item>

      <Form.Item name={fieldName('password')} className='mb-0' validateTrigger='onBlur'>
        <Input
          type='password'
          onBlur={e => form.setFieldsValue({ [fieldName('password')]: e.target.value.trim() })}
          placeholder='Password'
        />
      </Form.Item>

      <Form.Item name={fieldName('passwordConfirm')} className='mb-0' validateTrigger='onBlur'>
        <Input
          type='password'
          onBlur={e =>
            form.setFieldsValue({ [fieldName('passwordConfirm')]: e.target.value.trim() })
          }
          placeholder='Repeat Password'
        />
      </Form.Item>

      <Button type='primary' size='large' onClick={() => console.log('clicked')} block>
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
  )
}

export default SignUpModalContent
