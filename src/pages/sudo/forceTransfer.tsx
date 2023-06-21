// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Balance } from '@polkadot/types/interfaces'
import { formatBalance } from '@polkadot/util'
import { isEmptyArray, newLogger, nonEmptyStr, pluralize } from '@subsocial/utils'
import { Button, Form, Input } from 'antd'
import BN from 'bn.js'
import React, { useEffect, useState } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { OnlySudo } from 'src/components/auth/OnlySudo'
import { FormatBalance } from 'src/components/common/balances'
import { DfForm, DfFormButtons } from 'src/components/forms'
import { PageContent } from 'src/components/main/PageWrapper'
import { GetTxParamsAsyncFn } from 'src/components/substrate/SubstrateTxButton'
import { showErrorMessage, showSuccessMessage } from 'src/components/utils/Message'
import useSubstrate from '../../components/substrate/useSubstrate'

type FormValues = Partial<{
  tokens: number
  accounts: string
}>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type FormProps = {}

type Account = string

type AccountWithBalance = {
  account: Account
  balance: Balance
}

function RenderBalances({
  balances,
  title,
}: {
  balances: AccountWithBalance[]
  title: React.ReactNode
}) {
  return balances.length ? (
    <>
      <h3>{title}</h3>
      <ol>
        {balances.map(x => {
          const css = x.balance.gtn(0) ? 'text-success' : 'text-danger'
          return (
            <li key={x.account.toString()}>
              <code className={css + ' mr-3'}>{x.account.toString()} </code>
              <FormatBalance value={x.balance} />
            </li>
          )
        })}
      </ol>
    </>
  ) : null
}

const log = newLogger('ForceTransfer')

function InnerForm(props: FormProps) {
  const [form] = Form.useForm()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [positiveBalances, setPositiveBalances] = useState<AccountWithBalance[]>([])
  const [zeroBalances, setZeroBalances] = useState<AccountWithBalance[]>([])
  const [freeTokensPerAccount, setFreeTokensPerAccount] = useState<BN>(new BN(0))
  const { api, isApiReady } = useSubstrate()
  const myAddress = useMyAddress()

  useEffect(() => {
    let unsub: (() => void) | undefined
    let isMounted = true

    if (!isApiReady) return

    const sub = async () => {
      updateFreeTokensPerAccount()

      unsub = await api.query.system.account.multi(accounts, res => {
        const usedAccs = new Set<string>()
        const positiveBalances: AccountWithBalance[] = []
        const zeroBalances: AccountWithBalance[] = []

        res.forEach((r, i) => {
          const account = accounts[i]
          if (!usedAccs.has(account)) {
            const balance = (r as any).data.free as Balance
            const item = { account, balance }
            // if (balance.gtn(0)) {
            //   positiveBalances.push(item)
            // } else {
            zeroBalances.push(item)
            // }
            usedAccs.add(account)
          }
        })

        if (isMounted) {
          setPositiveBalances(positiveBalances)
          setZeroBalances(zeroBalances)
        }
      })
    }

    isMounted && sub().catch(err => console.error('Failed to load balances:', err))

    return () => {
      unsub && unsub()
      isMounted = false
    }
  }, [accounts.join(''), isApiReady])

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const updateFreeTokensPerAccount = () => {
    // WARN: do not move this code to global level: here we need Substrate API ready.
    const { decimals } = formatBalance.getDefaults()
    const inputTokens = getFieldValues().tokens
    inputTokens && setFreeTokensPerAccount(new BN(inputTokens * 10 ** decimals))
  }

  const hasZeroBalances = zeroBalances.length > 0

  const getTxParams: GetTxParamsAsyncFn = async () => {
    if (!api || !myAddress || freeTokensPerAccount.isZero() || isEmptyArray(zeroBalances)) return []

    const forceTransferTxs = await Promise.all(
      zeroBalances.map(x => {
        // return api.tx.balances.forceTransfer(sudo, x.account, freeTokensPerAccount)
        return api.tx.balances.forceTransfer(myAddress, x.account, freeTokensPerAccount)
      }),
    )

    return [api.tx.utility.batch(forceTransferTxs)]
  }

  return (
    <div {...props}>
      <DfForm form={form} layout='horizontal'>
        <Form.Item
          name={fieldName('tokens')}
          label='Tokens to drop'
          hasFeedback
          rules={[{ min: 0 }]}
        >
          <Input
            placeholder='Amount of tokens to drop to every account'
            onChange={updateFreeTokensPerAccount}
          />
        </Form.Item>

        <Form.Item name={fieldName('accounts')} label='Accounts'>
          <Input.TextArea
            placeholder='Account address per line'
            rows={6}
            style={{
              fontFamily: 'monospace',
              fontSize: '1rem',
            }}
          />
        </Form.Item>

        <Form.Item label=' '>
          <Button
            onClick={() => {
              const accsLines = getFieldValues().accounts || ''
              const accs = accsLines
                .split(/(\r\n|\r|\n)/)
                .filter(nonEmptyStr)
                .map(x => x.trim())

              log.debug({ accs })

              setAccounts(accs)
            }}
          >
            Read balances
          </Button>
        </Form.Item>

        {hasZeroBalances && (
          <DfFormButtons
            form={form}
            withReset={false}
            txProps={{
              customNodeApi: api,
              disabled: !hasZeroBalances,
              label: (
                <span>
                  Send <FormatBalance value={freeTokensPerAccount} />
                  {' to '} {pluralize({ count: zeroBalances.length, singularText: 'account' })}
                </span>
              ),
              tx: 'sudo.sudo',
              params: getTxParams,
              onSuccess: () => {
                showSuccessMessage('Tokens sent')
              },
              onFailed: () => {
                showErrorMessage('Failed to send tokens')
              },
            }}
          />
        )}
      </DfForm>

      <RenderBalances balances={zeroBalances} title='Balances' />
      <RenderBalances balances={positiveBalances} title='Positive balances' />
    </div>
  )
}

export function Page(props: FormProps) {
  const title = 'Sudo / forceTransfer'
  return (
    <OnlySudo>
      <PageContent className='EditEntityBox' meta={{ title }} title={title}>
        <InnerForm {...props} />
      </PageContent>
    </OnlySudo>
  )
}

export default Page
