import { Button, Form, Input, ModalProps } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import config from 'src/config'
import {
  useCreateReloadDomain,
  useCreateReloadMyDomains,
} from 'src/rtk/features/domains/domainHooks'
import { isValidAddress } from 'src/utils/address'
import { useMyAddress } from '../auth/MyAccountsContext'
import CustomModal, { CustomModalProps } from '../utils/CustomModal'
import LoadingTransaction from '../utils/LoadingTransaction'
import { registerDomainWithPromoCode } from '../utils/OffchainUtils'
import TwitterMock from '../utils/TwitterMock'
import { useManageDomainContext } from './manage/ManageDomainProvider'

const LoadingContent = () => <LoadingTransaction />

export default function ClaimFreeDomainModal({
  domain,
  promoCode,
  onCancel,
  ...props
}: { domain: string; promoCode: string | undefined } & CustomModalProps) {
  const myAddress = useMyAddress()
  const reloadMyDomains = useCreateReloadMyDomains()
  const reloadDomain = useCreateReloadDomain()
  const { clearPromoCode } = useManageDomainContext()

  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState('')

  const onSubmit = async ({ address }: { address: string }) => {
    if (!promoCode || !address) return
    setIsLoading(true)
    const res = await registerDomainWithPromoCode({
      promoCode,
      domain,
      address,
    })
    setTxHash(res)
    setIsLoading(false)
  }

  let modalTitle = "It seems that you haven't connected your wallet"
  let modalSubtitle: JSX.Element | string =
    "But don't worry! You can claim your domains without connecting to a wallet! 🎉"
  let Content = FormAddressInput
  if (txHash) {
    modalTitle = '🥳 Domain claim success!'
    modalSubtitle = 'Your username is ready to use'
    Content = SuccessContent
  } else if (isLoading) {
    modalTitle = '🕔 Processing your username'
    modalSubtitle = 'We are recording your claim on the blockchain.'
    Content = LoadingContent
  } else if (myAddress) {
    modalTitle = `You're one step away from owning ${domain} 🎉!`
    modalSubtitle = (
      <span>
        Are you sure to claim <strong>{domain}</strong> for address <strong>{myAddress}</strong>?
      </span>
    )
    Content = Confirmation
  }

  const afterFlowSucceed = () => {
    reloadMyDomains()
    clearPromoCode()
    reloadDomain(domain)
  }

  return (
    <CustomModal
      maskClosable={false}
      cancelText='Cancel'
      okText='Yes'
      title={modalTitle}
      subtitle={modalSubtitle}
      closable={!isLoading}
      className={clsx(txHash && 'text-center')}
      onCancel={param => {
        onCancel && onCancel(param)
        if (txHash) afterFlowSucceed()
      }}
      {...props}
    >
      <Content domain={domain} onSubmit={onSubmit} onCancel={onCancel} />
    </CustomModal>
  )
}

interface ContentProps {
  onSubmit: (data: { address: string }) => void
  domain: string
  onCancel?: ModalProps['onCancel']
}
function FormAddressInput({ onSubmit, domain }: ContentProps) {
  const [form] = Form.useForm()
  const addressInputName = 'address'

  return (
    <>
      <p>We just need you to provide us with the address to use the domain to.</p>
      <Form form={form} onFinish={values => onSubmit({ address: values[addressInputName] })}>
        <Form.Item
          name={addressInputName}
          rules={[
            ({ getFieldValue }) => ({
              async validator() {
                const address = getFieldValue(addressInputName)
                const isValid = isValidAddress(address)
                if (!isValid) {
                  return Promise.reject(new Error('Address is not a valid substrate address'))
                }
                return Promise.resolve()
              },
            }),
          ]}
        >
          <Input size='large' placeholder='Substrate Address' />
        </Form.Item>
        <Button htmlType='submit' type='primary' size='large' block className='mt-3'>
          Claim {domain}
        </Button>
      </Form>
    </>
  )
}

function Confirmation({ domain, onCancel, onSubmit }: ContentProps) {
  const myAddress = useMyAddress()
  return (
    <div className='d-flex align-items-center GapNormal mt-3'>
      <Button onClick={onCancel} block type='ghost' size='large'>
        Cancel
      </Button>
      <Button onClick={() => onSubmit({ address: myAddress! })} block type='primary' size='large'>
        Claim {domain}
      </Button>
    </div>
  )
}

function SuccessContent({ domain }: ContentProps) {
  const twitterText = `I just claimed my free Subsocial Username (${domain}) from ${config.appName} powered by @SubsocialChain!\n\nYou can now access my profile here:`

  const [domainWithoutTld] = domain.split('.')

  const domainUrl = `sub.id/${domainWithoutTld}`
  return (
    <div className={clsx('d-flex flex-column')}>
      <TwitterMock
        url={domainWithoutTld}
        twitterText={twitterText}
        buttonText='Tweet about it!'
        externalBaseUrl={'https://sub.id'}
      >
        <p>
          I just claimed my free Subsocial Username ({domain}) from {config.appName} powered by
          @SubsocialChain!
          <br />
          <br />
          You can now access my profile here:
          <br />
          <a href={`https://${domainUrl}`}>{domainUrl}</a>
        </p>
        <a>#{config.appName} #Subsocial</a>
      </TwitterMock>
    </div>
  )
}
