import { isStr } from '@subsocial/utils'
import { Button, Form, Input } from 'antd'
import axios from 'axios'
import { useCallback, useState } from 'react'
import {
  RegexValidations,
  useFormValidation,
} from 'src/components/auth/signIn/email/useFormValidation'
import { PageContent } from 'src/components/main/PageWrapper'
import { VALIDATION_DELAY } from 'src/config/ValidationsConfig'
import { debounceFunction } from 'src/utils/async'
import { onErrorHandler } from '../OffchainSigner/api/requests'
import MaintenanceAnimation from './Animation'
import styles from './Index.module.sass'

type FormValues = {
  email: string
}

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

const MaintenancePage = () => {
  const [form] = Form.useForm()

  const [error, setError] = useState<string | null>(null)
  const [isFormValid, setIsFormValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { isValidEmail } = useFormValidation()

  const handleSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const { email } = values

      await axios.post('https://api.subsocial.network/mail/add_email/518168', { email })
      setIsSuccess(true)
      setLoading(false)
    } catch (error) {
      onErrorHandler(error, setError, true)
      setLoading(false)
      setIsSuccess(false)
    }
  }

  const validateEmail = async () => {
    form.validateFields(['email'])
  }

  const handleValuesChange = (_: FormValues, allValues: FormValues) => {
    const isFilled = Object.values(allValues).every(value => Boolean(value))
    const isEmailValid = isValidEmail(allValues.email)
    const isValid = isFilled && isEmailValid
    setIsFormValid(isValid)
  }

  const debouncedValidateField = useCallback(debounceFunction(validateEmail, VALIDATION_DELAY), [])

  const handleAfterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setFieldsValue({ [fieldName('email')]: e.target.value.trim() })
    debouncedValidateField()
  }

  return (
    <PageContent
      meta={{ title: 'Maintenance page' }}
      className={styles.PageWrapper}
      withSidebar={false}
    >
      <div className={styles.PageInnerWrapper}>
        <div className={styles.PageTitleWrapper}>
          <MaintenanceAnimation height={180} width={180} />
          <div className={styles.PageTitle}>
            Polkaverse is currently undergoing maintenance as we prepare some exciting new features
          </div>
        </div>
        <div className={styles.FormSection}>
          <div className={styles.FormTitle}>
            Subscribe to our newsletter and don&apos;t miss the update:
          </div>
          <div className={styles.FormWrapper}>
            {isSuccess ? (
              <>
                <div className={styles.SuccessMessage}>
                  Thank you for subscribing! We will keep you updated.
                </div>
              </>
            ) : (
              <Form
                form={form}
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
                className='w-100'
              >
                <div className={styles.EmailForm}>
                  <Form.Item
                    name={fieldName('email')}
                    className={styles.EmailInput}
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
                  <Button
                    type='primary'
                    size='large'
                    disabled={!isFormValid}
                    loading={loading}
                    htmlType='submit'
                  >
                    Subscribe
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
    </PageContent>
  )
}

export default MaintenancePage
