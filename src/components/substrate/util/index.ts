// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { SubmittableResult } from '@polkadot/api'
import { GenericAccountId, Option, Text } from '@polkadot/types'
import { AccountId } from '@polkadot/types/interfaces'
import { Codec } from '@polkadot/types/types'
import { asAccountId, SubsocialApi } from '@subsocial/api'
import BN from 'bn.js'
import { resolveDomain } from 'src/components/domains/utils'
import { AddressProps } from 'src/components/profiles/address-views/utils/types'
import { resolveBn, toShortAddress } from 'src/components/utils'
import { AnyAccountId, SubstrateId } from 'src/types'
export * from './getTxParams'
export { isEqual } from './isEqual'

function toString<DFT>(
  value?: { toString: () => string },
  _default?: DFT,
): string | DFT | undefined {
  return value && typeof value.toString === 'function' ? value.toString() : _default
}

export type AnyText = string | Text | Option<Text>

export type AnyNumber = number | BN

export type AnyAddress =
  | string
  | AccountId
  | GenericAccountId
  | Option<AccountId>
  | Option<GenericAccountId>

export function stringifyAny<DFT>(value?: any, _default?: DFT): string | DFT | undefined {
  if (typeof value !== 'undefined') {
    if (value instanceof Option) {
      return stringifyText(value.unwrapOr(undefined))
    } else {
      return toString(value)
    }
  }
  return _default
}

export function stringifyText<DFT extends string>(
  value?: AnyText,
  _default?: DFT,
): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export function stringifyNumber<DFT>(value?: AnyNumber, _default?: DFT): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export function stringifyAddress<DFT>(
  value?: AnyAddress,
  _default?: DFT,
): string | DFT | undefined {
  return stringifyAny(value, _default)
}

export const getSpaceId = async (
  idOrHandle: string,
  subsocial: SubsocialApi,
): Promise<BN | undefined> => {
  if (idOrHandle.startsWith('@')) {
    // Drop '@' char and lowercase handle before searching for its space.
    const handle = idOrHandle.substring(1).toLowerCase()
    const meta = await subsocial.findDomain(resolveDomain(handle))
    const spaceId = meta?.innerSpace

    return spaceId ? new BN(spaceId) : undefined
  } else {
    return resolveBn(idOrHandle)
  }
}

export function getNewIdsFromEvent(txResult: SubmittableResult): BN[] {
  const newIds: BN[] = []

  txResult.events.find(event => {
    const {
      event: { data, method },
    } = event
    if (method.indexOf('Created') >= 0) {
      const [, /* owner */ ...ids] = data
      newIds.push(...(ids as unknown as BN[]))
      return true
    }
    return false
  })

  return newIds
}

export function getNewIdFromEvent(txResult: SubmittableResult): BN | undefined {
  const [newId] = getNewIdsFromEvent(txResult)
  return newId
}

type MaybeAccAddr = undefined | AnyAccountId

export function equalAddresses(addr1: MaybeAccAddr, addr2: MaybeAccAddr): boolean {
  if (addr1 === addr2) {
    return true
  } else if (!addr1 || !addr2) {
    return false
  } else {
    return asAccountId(addr1)?.eq(asAccountId(addr2)) || false
  }
}

type GetNameOptions = AddressProps & {
  isShort?: boolean
}

export const getProfileName = (options: GetNameOptions) => {
  const { owner, isShort = true, address } = options
  return (owner?.content?.name || (isShort ? toShortAddress(address) : address)).toString()
}

export const unwrapSubstrateId = (optId?: Option<Codec>): SubstrateId | undefined => {
  if (optId instanceof Option) {
    return optId.unwrapOr(undefined) as SubstrateId | undefined
  }

  return optId && (optId as SubstrateId)
}
