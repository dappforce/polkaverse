// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { QuestionCircleOutlined } from '@ant-design/icons'
import {
  balanceWithDecimal,
  convertToBalanceWithDecimal,
  isDefined,
  nonEmptyStr,
} from '@subsocial/utils'
import { Button, Card, CardProps, Checkbox, Col, Divider, Form, Input, Row, Tooltip } from 'antd'
import { FormInstance } from 'antd/es/form/Form'
import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import { useSubstrate } from '../substrate'
import { AccountInputField } from '../utils/forms/AccountInputField'
import { createFieldNameFn } from '../utils/forms/utils'
import { MutedDiv, MutedSpan } from '../utils/MutedText'
import TxButton from '../utils/TxButton'
import styles from './Energy.module.sass'
import { EnergySuccessModal } from './SuccessModal'
import { calculateTransactionCount } from './utils'

type WithForm = {
  form: FormInstance
}

type FormFields = {
  amount: BigNumber
  recipient: string
}

const fieldName = createFieldNameFn<FormFields>()

export const setAndValidateField = (form: FormInstance, name: string, value?: string) => {
  form.setFields([{ name, value }])
  form.validateFields([name]).catch(({ errorFields }) => {
    form.setFields(errorFields)
  })
}

type AmountInputProps = WithForm & {
  setAmount: (amount: BigNumber) => void
  onBlur?: (e: any) => void
}

export const AmountInput = React.memo(({ form, setAmount, onBlur }: AmountInputProps) => {
  const { tokenDecimal, tokenSymbol } = useSubstrate()
  const { balance: availableBalance } = useAuth()

  const maxAmount = convertToBalanceWithDecimal(availableBalance.toString(), tokenDecimal)

  const label = (
    <Row justify='space-between' className='w-100'>
      <Col>SUB amount to burn:</Col>
      <Col>
        <MutedSpan className='mr-2'>Balance:</MutedSpan>
        <FormatBalance value={availableBalance} decimals={tokenDecimal} currency={tokenSymbol} />
      </Col>
    </Row>
  )

  const setMaxAmount = () => setAndValidateField(form, fieldName('amount'), maxAmount.toString())

  const maxBtn = (
    <>
      <Button ghost type='primary' onClick={setMaxAmount} size='small'>
        MAX
      </Button>
    </>
  )

  return (
    <Form.Item
      name={fieldName('amount')}
      label={label}
      className={styles.AmountFormInput}
      required
      rules={[
        ({ getFieldValue }: any) => ({
          async validator() {
            const rawValue = getFieldValue(fieldName('amount'))
            const value = Number.parseFloat(rawValue).toFixed(4)

            let amount = new BigNumber(value)
            let err = ''

            if (!value || amount.isNaN() || amount.isZero()) {
              amount = new BigNumber(0)
            } else if (amount.gt(maxAmount)) {
              amount = new BigNumber(0)
              err = 'You cannot burn more than your available balance'
            }

            if (nonEmptyStr(err)) {
              setAmount && setAmount(amount)
              return Promise.reject(err)
            }

            setAmount && setAmount(balanceWithDecimal(amount.toString(), tokenDecimal))
            return Promise.resolve()
          },
        }),
      ]}
    >
      <Input
        onBlur={onBlur}
        placeholder='For example, 10'
        type='number'
        min='0'
        step='0.1'
        size='large'
        suffix={maxBtn}
      />
    </Form.Item>
  )
})

type EnergyInfoSectionProps = {
  amount?: BigNumber
}

const EnergyInfoSection = ({ amount }: EnergyInfoSectionProps) => {
  const {
    energy: { coefficient },
  } = useAuth()
  const { tokenDecimal } = useSubstrate()

  const txsCount = amount ? calculateTransactionCount(amount, coefficient, tokenDecimal) : 0
  return (
    <div className={styles.InfoSection}>
      <Row>
        <Col span={12} className='d-flex justify-content-between'>
          <div>
            <MutedDiv className={styles.FontNormal}>
              Transactions with SUB{' '}
              <Tooltip
                className='ml-2'
                title={
                  'The approximate number of transactions you can complete by using this many SUB tokens'
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </MutedDiv>
            <div className={'FontLarge'}>~ {(txsCount / coefficient).toFixed(0)}</div>
          </div>
          <Divider type='vertical' className='h-100 m-0' />
        </Col>
        <Col span={12} className='pl-3'>
          <MutedDiv className={styles.FontNormal}>
            Transactions with energy{' '}
            <Tooltip
              className='ml-2'
              title={
                'The approximate number of transactions you can complete by using energy, which will be created by burning this many SUB tokens'
              }
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </MutedDiv>
          <div className={'FontLarge'}>~ {txsCount.toFixed(0)}</div>
        </Col>
      </Row>
    </div>
  )
}

export interface EnergyFormProps extends CardProps {
  forSelfOnly?: boolean
  subscribeValues?: {
    amount?: number
    setAmount?: (amount: number) => void
    address?: string
    setAddress?: (address: string) => void
    noButton?: boolean
    setIsDisabled: (disabled: boolean) => void
  }
}
const EnergyForm = ({ forSelfOnly, subscribeValues, ...props }: EnergyFormProps) => {
  const [form] = Form.useForm()
  const myAddress = useMyAddress()
  const [amount, setAmount] = useState<BigNumber>()
  const [isAnotherRecipient, setIsAnotherRecipient] = useState(false)
  const [success, setSuccess] = useState(false)

  const buildTxParams = () => {
    if (!amount) return []

    const recipient = form.getFieldValue(fieldName('recipient'))

    return [recipient || myAddress, amount.toString()]
  }

  useEffect(() => {
    const outsideAmount = subscribeValues?.amount
    if (!isDefined(outsideAmount)) return
    form.setFieldsValue({ [fieldName('amount')]: outsideAmount })
    form.validateFields([fieldName('amount')])
  }, [subscribeValues?.amount])

  useEffect(() => {
    const outsideAddress = subscribeValues?.address
    if (!isDefined(outsideAddress)) return
    form.setFieldsValue({ [fieldName('recipient')]: outsideAddress })
  }, [subscribeValues?.address])

  const subscribeAmount = (e: any) => {
    const setOutsideAmount = subscribeValues?.setAmount
    setOutsideAmount && setOutsideAmount(parseFloat(e.target.value))
  }
  const subscribeAddress = (e: any) => {
    const setAddress = subscribeValues?.setAddress
    setAddress && setAddress(e.target.value)
  }

  const disableSubscriber = subscribeValues?.setIsDisabled
  useEffect(() => {
    if (!disableSubscriber) return
    disableSubscriber(!amount || amount.isZero())
  }, [disableSubscriber, amount])

  return (
    <Card {...props}>
      <Form form={form} layout='vertical'>
        <AmountInput form={form} setAmount={setAmount} onBlur={subscribeAmount} />
        {!forSelfOnly && (
          <div>
            <Checkbox onChange={e => setIsAnotherRecipient(e.target.checked)}>
              I want to send this energy to another account
            </Checkbox>
            <Tooltip title='Once created, energy is not transferrable. If you want, you are able to burn your SUB tokens to create energy in another account. For example, you can give your friends energy so that they can use dapps on Subsocial.'>
              <QuestionCircleOutlined />
            </Tooltip>
          </div>
        )}
        {isAnotherRecipient && (
          <AccountInputField
            name={fieldName('recipient')}
            onBlur={subscribeAddress}
            size='large'
            className='mt-3'
            label='Address of the recipient'
          />
        )}
      </Form>
      <EnergyInfoSection amount={amount} />
      {!subscribeValues?.noButton && (
        <TxButton
          disabled={!amount || amount.isZero()}
          className='mt-3'
          size='large'
          type='primary'
          block
          label='Generate energy'
          tx='energy.generateEnergy'
          params={buildTxParams}
          onSuccess={() => setSuccess(true)}
        />
      )}
      <EnergySuccessModal open={success} hide={() => setSuccess(false)} />
    </Card>
  )
}

export default EnergyForm
