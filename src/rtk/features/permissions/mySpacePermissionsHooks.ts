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
