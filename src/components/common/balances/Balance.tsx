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

function format({
  value,
  currency,
  decimals,
  withSi,
  isShort: _isShort,
  fixedDecimalsLength,
  precision,
  withMutedDecimals = true,
  alwaysShowDecimals = false,
}: {
  value: Compact<any> | BN | string
  currency: string
  fixedDecimalsLength?: number
  decimals: number
  withSi?: boolean
  isShort?: boolean
  precision?: number
  withMutedDecimals?: boolean
  alwaysShowDecimals?: boolean
}): React.ReactNode {
  // Remove any excess decimals, because this expects big integers
  const balanceValue = value.toString().split('.')[0]

  try {
    const [prefix, postfix] = formatBalance(balanceValue, {
      forceUnit: '-',
      decimals,
      withSi: false,
      withZero: true,
    }).split('.')
    const isShort = _isShort || (withSi && prefix.length >= K_LENGTH && !alwaysShowDecimals)

    if (prefix.length > M_LENGTH && !alwaysShowDecimals) {
      const balance = formatBalance(balanceValue, { decimals, withUnit: false })
      return (
        <>
          {balance}&nbsp;{currency}
        </>
      )
    }

    let afterDecimalPoint =
      precision || fixedDecimalsLength
        ? parseFloat(`0.${postfix}`).toPrecision(precision).substring(2)
        : postfix || '0000'
    if (fixedDecimalsLength) {
      afterDecimalPoint = afterDecimalPoint
        .padEnd(fixedDecimalsLength, '0')
        .substring(0, fixedDecimalsLength)
    }

    return (
      <>
        {prefix}
        {!isShort && (
          <>
            .
            <span className={clsx(withMutedDecimals && 'DfBalanceDecimals')}>
              {afterDecimalPoint}
            </span>
          </>
        )}
        &nbsp;{currency}
      </>
    )
  } catch {
    return null
  }
}

type FormatBalanceProps = BareProps & {
  value?: Compact<any> | BN | string
  decimals?: number
  currency?: string
  isShort?: boolean
  precision?: number
  withMutedDecimals?: boolean
  alwaysShowDecimals?: boolean
  fixedDecimalsLength?: number
}

export const FormatBalance = ({
  value,
  decimals,
  currency,
  isShort,
  className,
  precision,
  fixedDecimalsLength,
  withMutedDecimals = true,
  alwaysShowDecimals,
  ...bareProps
}: FormatBalanceProps) => {
  if (!value) return null

  const { unit: defaultCurrency, decimals: defaultDecimal } = formatBalance.getDefaults()

  const balance = format({
    value,
    currency: currency || defaultCurrency,
    decimals: decimals || defaultDecimal,
    withSi: true,
    isShort,
    precision,
    fixedDecimalsLength,
    withMutedDecimals,
    alwaysShowDecimals,
  })

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
