// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { isDef } from '@subsocial/utils'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { FetchManyArgs, useActions } from 'src/rtk/app/helpers'
import { useFetch } from 'src/rtk/app/hooksCommon'
import { SpaceContent, SpaceId, SpaceWithSomeDetails } from '../../../types'
import { useAppSelector } from '../../app/store'
import { selectSpaceContentById } from '../contents/contentsSlice'
import { fetchMyPermissionsBySpaceIds } from '../permissions/mySpacePermissionsSlice'
import {
  fetchSpaces,
  SelectSpaceArgs,
  SelectSpacesArgs,
  selectSpaceStructById,
} from './spacesSlice'

export const useSelectSpace = (spaceId?: SpaceId): SpaceWithSomeDetails | undefined => {
  const struct = useAppSelector(state =>
    spaceId ? selectSpaceStructById(state, spaceId) : undefined,
  )

  const cid = struct?.contentId
  const content = useAppSelector(state => (cid ? selectSpaceContentById(state, cid) : undefined))

  if (!struct) return undefined

  return {
    id: struct.id,
    struct,
    content,
  }
}

export function useSelectSpaces(ids: SpaceId[] = []): SpaceWithSomeDetails[] {
  const spaces = useAppSelector(state => ids.map(id => selectSpaceStructById(state, id))).filter(
    isDef,
  )

  const contentByCidMap = new Map<string, SpaceContent>()
  useAppSelector(state =>
    spaces.forEach(({ contentId }) => {
      if (contentId) {
        const content = selectSpaceContentById(state, contentId)
        content && contentByCidMap.set(contentId, content)
      }
    }),
  )

  const results = spaces.map(struct => {
    const contentId = struct.contentId
    const content = contentId ? contentByCidMap.get(contentId) : undefined
    return { struct, content } as SpaceWithSomeDetails
  })

  return results
}

// export const useFetchSpace = (args: SelectSpaceArgs) => {
//   return useFetchEntity(useSelectSpace, fetchSpaces, args)
// }

export const useFetchSpaces = (args: SelectSpacesArgs) => {
  return useFetch(fetchSpaces, args)
}

export const useFetchSpacesWithMyPermissions = (
  spaceIds: SpaceId[],
  additionalArgs?: Partial<FetchManyArgs<{}>>,
) => {
  const myAddress = useMyAddress()
  const { subsocial } = useSubsocialApi()

  const args: FetchManyArgs<{}> = { ids: spaceIds, api: subsocial, ...additionalArgs }
  const { loading: loadingPermission } = useFetch(fetchMyPermissionsBySpaceIds, {
    ...args,
    myAddress,
  })
  const { loading: loadingSpaces } = useFetch(fetchSpaces, args)

  return {
    loading: loadingPermission || loadingSpaces,
  }
}

export const useCreateReloadSpace = () => {
  return useActions<SelectSpaceArgs>(({ dispatch, api, args: { id } }) => {
    const args = { api, ids: [id], reload: true }
    dispatch(fetchMyPermissionsBySpaceIds(args))
    dispatch(fetchSpaces(args))
  })
}
