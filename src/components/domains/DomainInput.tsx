import { SearchOutlined } from '@ant-design/icons'
import { isEmptyStr, nonEmptyStr } from '@subsocial/utils'
import { Button, Form, Input } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { useIsMobileWidthOrDevice } from '../responsive'
import { useSubstrate } from '../substrate'
import styles from './index.module.sass'
import { resolveDomain } from './utils'

export type DomainParts = {
  first: string
  second: string
}

type DomainInputProps = {
  onChange?: (domain?: string) => void
}

export const InputDomain = ({ onChange }: DomainInputProps) => {
  const refInput = useRef<any>(null)
  const router = useRouter()
  const isMobile = useIsMobileWidthOrDevice()

  const { domain } = router.query

  useEffect(() => {
    if (nonEmptyStr(domain)) {
      refInput.current.input.value = domain
      onChange && onChange(domain)
    }
  }, [domain])

  const onSearchHandler = () => {
    const domain = refInput.current.input.value?.toLowerCase()

    onChange && onChange(domain)
  }

  return (
    <section>
      <Input.Group compact size='large' className={styles.DomainInput}>
        <Input
          placeholder='Enter domain that you want'
          ref={refInput}
          onPressEnter={onSearchHandler}
          size='large'
        />
        <Button type='primary' ghost={!!domain} style={{ flexBasis: '15%' }} size='large' onClick={onSearchHandler}>
          {isMobile ? <SearchOutlined /> : 'Search'}
        </Button>
      </Input.Group>
    </section>
  )
}

export const DomainForm = ({ onChange }: DomainInputProps) => {
  const [form] = Form.useForm()
  const router = useRouter()
  const { api } = useSubstrate()
  const minDomainLength = api?.consts.domains.minDomainLength

  const inputName = 'domain'

  return (
    <Form form={form} className='mt-3'>
      <Form.Item
        name={inputName}
        help={`Minimum length is ${minDomainLength} characters`}
        rules={[
          ({ getFieldValue }) => ({
            async validator() {
              const domain = getFieldValue(inputName)?.toLowerCase()
              const [domainWithoutTld] = domain.split('.')
              if (domainWithoutTld.length < minDomainLength) {
                return Promise.reject(
                  new Error(`Domain need in range from ${minDomainLength} to 63`),
                )
              }

              if (!isEmptyStr(domain)) {
                const sanitizeDomain = resolveDomain(domain)

                onChange && onChange(sanitizeDomain)
                router.push({ query: { ...router.query, domain: sanitizeDomain } })
                return Promise.resolve()
              }
              return Promise.reject(
                new Error('The domain name should be a-z or A-Z or 0-9 and hyphen (-)'),
              )
            },
          }),
        ]}
      >
        <InputDomain />
      </Form.Item>
    </Form>
  )
}

export default DomainForm
