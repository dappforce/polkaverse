import { balanceWithDecimal, isDef, toSubsocialAddress } from '@subsocial/utils'
import { Avatar, Col, Form, FormInstance, Row, Select } from 'antd'
import BN from 'bignumber.js'
import clsx from 'clsx'
import { capitalize } from 'lodash'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useMyAccountsContext } from 'src/components/auth/MyAccountsContext'
import Name from 'src/components/profiles/address-views/Name'
import { useResponsiveSize } from 'src/components/responsive'
import { toShortAddress } from 'src/components/utils'
import BaseAvatar from 'src/components/utils/DfAvatar'
import { showSuccessMessage } from 'src/components/utils/Message'
import { MutedDiv, MutedSpan } from 'src/components/utils/MutedText'
import { useChainInfo } from 'src/rtk/features/chainsInfo/chainsInfoHooks'
import { useSelectProfile } from '../../rtk/features/profiles/profilesHooks'
import { TipAmountInput } from './AmountInput'
import { useTipContext } from './DonateModalContext'
import LazyTxButton from './LazyTxButton'
import { currencyNetworks } from './SupportedTokens'
import {
  BigN_ZERO,
  convertAddressToChainFormat,
  DonateProps,
  fieldName,
  getIconUrlFromSubId,
} from './utils'

type SelectAccountProps = {
  address: string
  ss58Format?: number
}

const SelectAccount = ({ address, ss58Format }: SelectAccountProps) => {
  const profileData = useSelectProfile(address)

  return (
    <div className='d-flex justify-content-between align-items-center'>
      <div className='d-flex justify-content-center align-items-center'>
        <BaseAvatar size={24} identityValue={address} avatar={profileData?.content?.image} />
        <Name
          containerClassName='position-relative'
          style={{ top: '-1px' }}
          address={address}
          asLink={false}
        />
      </div>
      <div className='position-relative' style={{ top: '-1px' }}>
        {toShortAddress(convertAddressToChainFormat(address, ss58Format)!)}
      </div>
    </div>
  )
}

type TransferButtonProps = {
  form: FormInstance
  recipient: string
}

const TransferButton = ({ form, recipient }: TransferButtonProps) => {
  const { sender, infoByNetwork, network, amount, setSuccess } = useTipContext()

  const decimals = infoByNetwork?.tokenDecimals[0]

  const buildTxParams = () => {
    const amount = new BN(form.getFieldValue(fieldName('amount')))

    if (!recipient || !decimals || amount.eq(BigN_ZERO)) return []

    return [recipient, balanceWithDecimal(amount.toString(), decimals).toString()]
  }

  return (
    <LazyTxButton
      accountId={sender}
      tx='balances.transfer'
      network={network!}
      disabled={!network || !sender || !amount}
      params={buildTxParams}
      onSuccess={() => {
        showSuccessMessage('Tip success')
        setSuccess(true)
      }}
      type='primary'
      size='large'
      block
      label={'Transfer'}
    />
  )
}

export const DonateCard = ({ recipientAddress }: DonateProps) => {
  const [form] = Form.useForm()
  const profileData = useSelectProfile(recipientAddress)
  const {
    query: { address },
  } = useRouter()
  const addressFromUrl = address?.toString()

  const { isMobile } = useResponsiveSize()
  const chainInfo = useChainInfo()

  const { setCurrency, setSender, currency, infoByNetwork } = useTipContext()

  const {
    state: { accounts },
  } = useMyAccountsContext()

  const mySubsocialAddress = toSubsocialAddress(addressFromUrl)

  const accountsForChoosing = accounts
    .filter(x => toSubsocialAddress(x.address) !== mySubsocialAddress)
    .map(x => x.address)

  const ss58Format = infoByNetwork?.ss58Format

  const defaultSender = accountsForChoosing[0]

  useEffect(() => {
    if (!defaultSender) return

    setSender(defaultSender)
  }, [defaultSender])

  return (
    <Form form={form} layout='vertical' className='mt-0 p-3'>
      <div className='d-flex align-items-center mb-3'>
        <div>
          <BaseAvatar
            identityValue={recipientAddress}
            avatar={profileData?.content?.image}
            size={64}
          />
        </div>
        <div>
          <MutedDiv>Recipient:</MutedDiv>
          <Name address={recipientAddress} owner={profileData} />
          <MutedDiv style={{ fontSize: '0.85rem' }}>
            {isMobile ? toShortAddress(recipientAddress) : recipientAddress}
          </MutedDiv>
        </div>
      </div>

      <Form.Item name={fieldName('sender')} label={'Sender'} required>
        <Select
          size='large'
          defaultValue={defaultSender}
          style={{ width: '100%' }}
          onChange={setSender}
        >
          {accountsForChoosing?.map(account => (
            <Select.Option key={account} value={account}>
              <SelectAccount address={account} ss58Format={ss58Format} />
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Row>
        <Col span={isMobile ? 24 : 10}>
          <Form.Item
            name={fieldName('currency')}
            label={'Token'}
            required
            className={clsx(!isMobile && 'mr-3')}
          >
            <Select
              defaultValue={currency}
              value={currency}
              onSelect={(currency: string) => setCurrency(currency)}
              size='large'
            >
              {currencyNetworks
                .map(([currency, network]) => {
                  const info = chainInfo[network]
                  if (!info) return null

                  const isConnected = info.connected

                  if (!isConnected) return undefined

                  return (
                    <Select.Option key={currency} value={currency}>
                      <div className='d-flex align-items-center'>
                        <Avatar size='small' src={getIconUrlFromSubId(info.icon)} />
                        <span className='ml-2 position-relative' style={{ top: '-1px' }}>
                          {currency}
                          <MutedSpan className='ml-2'>{capitalize(network)}</MutedSpan>
                        </span>
                      </div>
                    </Select.Option>
                  )
                })
                .filter(isDef)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={isMobile ? 24 : 14}>
          <TipAmountInput form={form} />
        </Col>
      </Row>

      <div>
        <TransferButton form={form} recipient={recipientAddress} />
      </div>
    </Form>
  )
}
