// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { BN_ZERO } from '@polkadot/util'
import { convertToBalanceWithDecimal, nonEmptyStr } from '@subsocial/utils'
import { Button, Col, Form, FormInstance, Input, Row } from 'antd'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import React, { useEffect, useState } from 'react'
import { FormatBalance } from 'src/components/common/balances'
import { MutedSpan } from 'src/components/utils/MutedText'
import { getAccountBalancesByNetwork } from 'src/components/utils/OffchainUtils'
import { useTipContext } from './DonateModalContext'
import styles from './index.module.sass'
import { BigN_ZERO, fieldName, setAndValidateField } from './utils'

export type AccountInfoByChain = {
  accountId: string
  totalBalance: string
  freeBalance: string
  frozenFee: string
  reservedBalance: string
  frozenMisc: string
}

type ContributionAmountInputProps = {
  form: FormInstance
}

const getTransferableBalance = ({ freeBalance, frozenMisc, frozenFee }: AccountInfoByChain) => {
  return new BN(freeBalance).sub(new BN(frozenMisc || frozenFee || BN_ZERO))
}

type UseBalancesByNetworkProps = {
  account?: string
  network?: string
  currency?: string
}

export const useBalancesByNetwork = ({
  account,
  network,
  currency,
}: UseBalancesByNetworkProps): AccountInfoByChain | undefined => {
  const [balancesByCurrency, setBalances] = useState<Record<string, AccountInfoByChain>>()

  useEffect(() => {
    if (!account || !network) return

    getAccountBalancesByNetwork({ account, network }).then(setBalances).catch(console.error)
  }, [network, account])

  if (!balancesByCurrency || !currency) return

  return balancesByCurrency[currency]
}

export const TipAmountInput = React.memo(({ form }: ContributionAmountInputProps) => {
  const { sender, infoByNetwork, network, currency, setAmount } = useTipContext()
  const decimals = infoByNetwork?.tokenDecimals[0]

  const balancesByCurrency = useBalancesByNetwork({ account: sender, network, currency })
  const availableBalance = balancesByCurrency ? getTransferableBalance(balancesByCurrency) : BN_ZERO

  const maxAmount = decimals
    ? convertToBalanceWithDecimal(availableBalance.toString(), decimals)
    : BigN_ZERO

  const label = (
    <Row justify='space-between' className='w-100'>
      <Col>Amount</Col>
      <Col>
        <MutedSpan className='mr-2'>Balance:</MutedSpan>
        {network ? (
          <FormatBalance value={availableBalance} decimals={decimals} currency={currency} />
        ) : (
          0
        )}
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
            const value = getFieldValue(fieldName('amount'))

            let amount = new BigNumber(value)
            let err = ''

            if (!value || amount.isNaN() || amount.isZero()) {
              amount = BigN_ZERO
            } else if (amount.gt(maxAmount)) {
              err = 'You cannot tip more than you available balance'
            }

            if (nonEmptyStr(err)) {
              return Promise.reject(err)
            }

            setAmount && setAmount(value)
            return Promise.resolve()
          },
        }),
      ]}
    >
      <Input type='number' min='0' step='0.1' size='large' suffix={maxBtn} />
    </Form.Item>
  )
})
