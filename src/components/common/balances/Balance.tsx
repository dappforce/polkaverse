import { Compact } from '@polkadot/types'
import { formatBalance } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'
import BN from 'bn.js'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { useBalancesByNetwork } from 'src/components/donate/AmountInput'
import { useLazyConnection } from 'src/components/lazy-connection/LazyConnectionContext'
import { BareProps } from 'src/components/utils/types'
import { useGetDecimalAndSymbol } from 'src/components/utils/useGetDecimalsAndSymbol'
import { NodeNames } from 'src/config/types'
import { AnyAccountId } from 'src/types'
import { useKusamaContext } from '../../kusama/KusamaContext'
import useSubstrate from '../../substrate/useSubstrate'

const log = newLogger('useCreateBallance')

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1
const K_LENGTH = 3 + 1

function format(
  value: Compact<any> | BN | string,
  currency: string,
  decimals: number,
  withSi?: boolean,
  _isShort?: boolean,
  precision?: number,
): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, {
    forceUnit: '-',
    decimals,
    withSi: false,
    withZero: true,
  }).split('.')
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH)

  if (prefix.length > M_LENGTH) {
    const balance = formatBalance(value, { decimals, withUnit: false })
    return (
      <>
        {balance}&nbsp;{currency}
      </>
    )
  }

  console.log(postfix, parseFloat(`0.${postfix}`).toPrecision(precision).substring(2))

  return (
    <>
      {prefix}
      {!isShort && (
        <>
          .
          <span className='DfBalanceDecimals'>
            {precision
              ? parseFloat(`0.${postfix}`).toPrecision(precision).substring(2)
              : postfix || '0000'}
          </span>
        </>
      )}
      &nbsp;{currency}
    </>
  )
}

type FormatBalanceProps = BareProps & {
  value?: Compact<any> | BN | string
  decimals?: number
  currency?: string
  isShort?: boolean
  precision?: number
}

export const FormatBalance = ({
  value,
  decimals,
  currency,
  isShort,
  className,
  precision,
  ...bareProps
}: FormatBalanceProps) => {
  if (!value) return null

  const { unit: defaultCurrency, decimals: defaultDecimal } = formatBalance.getDefaults()

  const balance = format(
    value,
    currency || defaultCurrency,
    decimals || defaultDecimal,
    true,
    isShort,
    precision,
  )

  return (
    <span className={clsx('DfFormatBalance', className)} {...bareProps}>
      {balance}
    </span>
  )
}

export const useCreateBalance = (address?: AnyAccountId) => {
  const [balance, setBalance] = useState<BN>()
  const { api, isApiReady } = useSubstrate()

  useEffect(() => {
    if (!address || !isApiReady) return

    formatBalance.setDefaults({
      decimals: api.registry.chainDecimals,
      unit: api.registry.chainTokens,
    })

    let isMounted = true
    let unsub: (() => void) | undefined

    const sub = async () => {
      unsub = await api.derive.balances.all(address, data => {
        const balance = data.availableBalance
        isMounted && setBalance(balance)
      })
    }

    isMounted && sub().catch(err => log.error('Failed load balance:', err))

    return () => {
      unsub && unsub()
      isMounted = false
    }
  }, [address, isApiReady])

  if (!balance) return undefined

  return balance
}

export const useBalanceByNetwork = (network: NodeNames, address?: AnyAccountId) => {
  const [balance, setBalance] = useState<BN>()
  const api = useLazyConnection(network)

  const isApiConnected = api?.isConnected

  useEffect(() => {
    if (!api || !isApiConnected || !address) return

    let unsub: any

    const subscribe = async () => {
      unsub = await api.derive.balances.all(address, ({ availableBalance }) => {
        setBalance(availableBalance)
      })
    }

    subscribe()

    return () => {
      unsub && unsub()
    }
  }, [address, isApiConnected])

  if (!balance) return undefined

  return balance
}

export const FormatKsmBalance = ({ value, decimals, currency, ...props }: FormatBalanceProps) => {
  const { ksmToken, ksmDecimals } = useKusamaContext()

  return (
    <FormatBalance
      value={value}
      currency={currency || ksmToken}
      decimals={decimals || ksmDecimals}
      {...props}
    />
  )
}

type CommonBalanceProps = {
  address: AnyAccountId
  label?: React.ReactNode
}

type NativeBalanceProps = CommonBalanceProps

export const NativeBalance = ({ address, label }: NativeBalanceProps) => {
  const balance = useCreateBalance(address)

  if (!balance) return null

  const balanceView = <FormatBalance value={balance} />

  return (
    <span>
      {label}
      {balanceView}
    </span>
  )
}

type BalanceByNetworkProps = CommonBalanceProps & {
  network?: string
}

export const BalanceByNetwork = ({ address, label, network }: BalanceByNetworkProps) => {
  const { decimal, symbol } = useGetDecimalAndSymbol(network)

  const balance = useBalancesByNetwork({
    account: address.toString(),
    network: network,
    currency: symbol,
  })

  if (!balance) return null

  const balanceView = (
    <FormatBalance value={balance.freeBalance} decimals={decimal} currency={symbol} />
  )

  return (
    <span>
      {label}
      {balanceView}
    </span>
  )
}
