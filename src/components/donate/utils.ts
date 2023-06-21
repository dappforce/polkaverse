// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { encodeAddress, isEthereumAddress } from '@polkadot/util-crypto'
import { FormInstance } from 'antd'
import BN from 'bignumber.js'
import { AccountId } from 'src/types'

type FormFields = {
  sender: string
  amount: string
  currency: string
}

export type DonateProps = {
  recipientAddress: AccountId
  renderButtonElement?: (onClick: () => void) => JSX.Element
}

export const fieldName = (name: keyof FormFields) => name

export const setAndValidateField = (form: FormInstance, name: string, value?: string) => {
  form.setFields([{ name, value }])
  form.validateFields([name]).catch(({ errorFields }) => {
    form.setFields(errorFields)
  })
}

export const convertAddressToChainFormat = (address?: string, ss58Format?: number) => {
  if (!address || ss58Format === undefined || isEthereumAddress(address)) return

  return encodeAddress(address.toString(), ss58Format)
}

export const BigN_ZERO = new BN(0)

export const getIconUrlFromSubId = (icon: string) => `https://sub.id/images/${icon}`
