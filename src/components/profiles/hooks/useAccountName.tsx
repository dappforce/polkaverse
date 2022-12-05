import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { toShortAddress } from 'src/components/utils'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useExtensionName } from '../address-views/utils'

export default function useAccountName(address?: string) {
  const myAddress = useMyAddress()
  const usedAddress = address ?? myAddress
  const shortAddress = toShortAddress(usedAddress ?? '')

  const profile = useSelectProfile(usedAddress)
  const extName = useExtensionName(usedAddress ?? '')
  return profile?.content?.name || extName || shortAddress
}
