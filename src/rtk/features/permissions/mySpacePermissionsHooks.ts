// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { useFetch } from 'src/rtk/app/hooksCommon'
import { SpaceId } from 'src/types'
import { fetchMyPermissionsBySpaceIds } from './mySpacePermissionsSlice'

export const useFetchMyPermissionsBySpaceId = (spaceId?: SpaceId) => {
  const myAddress = useMyAddress()
  const { subsocial } = useSubsocialApi()
  const ids = spaceId ? [spaceId] : []

  return useFetch(fetchMyPermissionsBySpaceIds, { ids, myAddress, api: subsocial })
}
