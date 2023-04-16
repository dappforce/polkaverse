import { Compact } from '@polkadot/types'
import { formatBalance } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'
import BN from 'bn.js'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { useLazyConnection } from 'src/components/lazy-connection/LazyConnectionContext'
import { BareProps } from 'src/components/utils/types'
import { NodeNames } from 'src/config/types'
import { AnyAccountId } from 'src/types'
import { useKusamaContext } from '../../kusama/KusamaContext'
import useSubstrate from '../../substrate/useSubstrate'
import { useGetDecimalAndSymbol } from 'src/components/domains/dot-seller/utils'
import { useBalancesByNetwork } from 'src/components/donate/AmountInput'

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
): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { forceUnit: '-', decimals, withSi: false }).split(
    '.',
  )
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH)

  if (prefix.length > M_LENGTH) {
    const balance = formatBalance(value, { decimals, withUnit: false })
    return (
      <>
        {balance}&nbsp;{currency}
      </>
    )
  }

  return (
    <>
      {prefix}
      {!isShort && (
        <>
          .<span className='DfBalanceDecimals'>{postfix || '0000'}</span>
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
}

export const FormatBalance = ({
  value,
  decimals,
  currency,
  isShort,
  className,
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
        const balance = data.freeBalance
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

type BalanceProps = {
  address: AnyAccountId
  label?: React.ReactNode
  network?: string
}

export const Balance = ({ address, label, network }: BalanceProps) => {
  const balance = useCreateBalance(address)

  const { decimal, symbol } = useGetDecimalAndSymbol(network)

  const otherNetworkBalance = useBalancesByNetwork({
    account: address.toString(),
    network: network,
    currency: symbol,
  })

  if (!balance) return null

  let balanceView = <FormatBalance value={balance} />

  if(network) {
    if(!otherNetworkBalance) return null

    balanceView = <FormatBalance value={otherNetworkBalance.freeBalance} decimals={decimal} currency={symbol} />
  }

  return (
    <span>
      {label}
      {balanceView}
    </span>
  )
}
