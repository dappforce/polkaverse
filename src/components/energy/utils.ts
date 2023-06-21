// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { ApiPromise } from '@polkadot/api'
import { convertToBalanceWithDecimal } from '@subsocial/utils'
import BN from 'bignumber.js'

export type EnergyStatus = 'normal' | 'low' | 'zero'

export type EnergyState = {
  status: EnergyStatus
  transactionsCount: number
  coefficient: number
}

export const getEnergyCoef = async (api: ApiPromise) => {
  const coefBn = await api.query.energy.valueCoefficient()
  return new BN(coefBn.toString()).div(1000000000).toNumber()
}

const CRITICAL_TRANSACTIONS_COUNT = 5
const MEDIUM_TX_FEE = 0.02
const TX_PER_SUB = 1 / MEDIUM_TX_FEE

export const calculateTransactionCount = (
  energyBalance: BN,
  coefficient: number,
  tokenDecimal: number,
) => {
  const transactionsBn = energyBalance
    .multipliedBy(new BN(coefficient))
    .multipliedBy(new BN(TX_PER_SUB))
  return convertToBalanceWithDecimal(transactionsBn.toString(), tokenDecimal).toNumber()
}

export const calculateEnergyState = (
  energyValue: string,
  coefficient: number,
  tokenDecimal: number,
): EnergyState => {
  const energyBalance = new BN(energyValue)

  const transactionsCount = calculateTransactionCount(energyBalance, coefficient, tokenDecimal)

  let status: EnergyStatus = 'normal'

  if (energyBalance.isZero()) {
    status = 'zero'
  } else if (CRITICAL_TRANSACTIONS_COUNT >= transactionsCount) {
    status = 'low'
  }

  return {
    coefficient,
    transactionsCount,
    status,
  }
}
