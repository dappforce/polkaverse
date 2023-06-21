// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { formatBalance, formatNumber } from '@polkadot/util'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'

export const simpleFormatBalance = (
  balance: BN | string | number,
  decimals?: number,
  currency?: string,
  withUnit = true,
) => {
  const { unit, decimals: defaultDecimals } = formatBalance.getDefaults()

  return formatBalance(balance, {
    decimals: decimals || defaultDecimals,
    forceUnit: currency || unit,
    withUnit,
  })
}

const TEN_BN = new BigNumber(10)

export const balanceWithDecimal = (balance: string | number, decimal: number) =>
  new BigNumber(balance).multipliedBy(TEN_BN.pow(new BigNumber(decimal)))

export const convertToBalanceWithDecimal = (balance: string | number, decimal: number) =>
  new BigNumber(balance).dividedBy(TEN_BN.pow(new BigNumber(decimal)))

export const formatBalanceWithoutDecimals = (balance: BigNumber, symbol: string) =>
  `${formatNumber(new BN(balance.toString()))} ${symbol}`

type ShortMoneyProps = {
  num: number
  prefix?: string
  suffix?: string
  fractions?: number
}

function moneyToString({ num, prefix = '', suffix, fractions = 2 }: ShortMoneyProps) {
  const _fractions = num < 1 ? fractions : 1

  const suffixPart = suffix ? ' ' + suffix : ''
  return `${prefix}${num.toFixed(_fractions)}${suffixPart}`
}

const num1K = 1000
const num1M = num1K ** 2
const num1B = num1K ** 3
const num1T = num1K ** 4

export function toShortMoney({ num, ...props }: ShortMoneyProps): string {
  if (num >= num1K && num < num1M) {
    return moneyToString({ num: num / num1K, ...props }) + 'K'
  } else if (num >= num1M && num < num1B) {
    return moneyToString({ num: num / num1M, ...props }) + 'M'
  } else if (num >= num1B && num < num1T) {
    return moneyToString({ num: num / num1B, ...props }) + 'B'
  }
  return moneyToString({ num, ...props })
}
