import { GenericAccountId } from '@polkadot/types'
import registry from '@subsocial/api/utils/registry'
import { isEmptyStr } from '@subsocial/utils'

export const isAccountId = (address: string) => {
  if (isEmptyStr(address)) return false

  try {
    return !!new GenericAccountId(registry, address)
  } catch {
    return false
  }
}
