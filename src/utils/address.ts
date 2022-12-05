import { decodeAddress, encodeAddress as encodePolkadotAddress } from '@polkadot/keyring'
import { hexToU8a, isHex } from '@polkadot/util'

export function isValidAddress(address: string) {
  try {
    encodePolkadotAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}
