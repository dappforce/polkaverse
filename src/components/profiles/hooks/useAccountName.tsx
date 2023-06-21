// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
