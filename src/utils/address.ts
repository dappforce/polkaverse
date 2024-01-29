import { decodeAddress, encodeAddress as encodePolkadotAddress } from '@polkadot/keyring'
import { hexToU8a, isHex } from '@polkadot/util'
import { toSubsocialAddress } from '@subsocial/utils'

export function isValidAddress(address: string) {
  try {
    encodePolkadotAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}

export function convertToSubsocialAddress(address?: string) {
  if (!address) return address

  try {
    const subsocialAddress = toSubsocialAddress(address)
    return subsocialAddress
  } catch {
    return undefined
  }
}
