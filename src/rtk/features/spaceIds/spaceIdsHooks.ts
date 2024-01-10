import { shallowEqual } from 'react-redux'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useActions } from 'src/rtk/app/helpers'
import { useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { AccountId, DataSourceTypes, SpaceWithSomeDetails } from 'src/types'
import { selectSpaces } from '../spaces/spacesSlice'
import {
  fetchEntityOfSpaceIdsByFollower,
  selectEntityOfSpaceIdsByFollower,
} from './followedSpaceIdsSlice'
import {
  fetchSpaceIdsOwnedByAccount,
  selectEntityOfSpaceIdsByOwner,
  selectSpaceIdsByOwner,
} from './ownSpaceIdsSlice'
import {
  fetchSpaceIdsWithRolesByAccount,
  selectSpaceIdsWithRolesByAccount,
} from './spaceIdsWithRolesByAccountSlice'

export const useFetchSpaceIdsByOwner = (owner: AccountId) => {
  const { entity, ...other } = useFetchOneEntity(
    selectEntityOfSpaceIdsByOwner,
    fetchSpaceIdsOwnedByAccount,
    { id: owner },
  )

  return {
    spaceIds: entity?.ownSpaceIds || [],
    ...other,
  }
}

export const useFetchSpaceIdsByFollower = (follower: AccountId, dataSource?: DataSourceTypes) => {
  const { entity, ...other } = useFetchOneEntity(
    selectEntityOfSpaceIdsByFollower,
    fetchEntityOfSpaceIdsByFollower,
    { id: follower, dataSource },
  )

  return {
    spaceIds: entity?.followedSpaceIds || [],
    ...other,
  }
}

export const useCreateReloadSpaceIdsRelatedToAccount = () => {
  return useActions<AccountId>(({ dispatch, args: id, ...props }) => {
    dispatch(fetchSpaceIdsOwnedByAccount({ id, reload: true, ...props }))
    dispatch(fetchSpaceIdsWithRolesByAccount({ id, reload: true, ...props }))
  })
}

/** Reload three lists of space ids: that I own, I follow, I have any role. */
export const useCreateReloadSpaceIdsForMyAccount = () => {
  const myAddress = useMyAddress()

  return useActions<void>(({ dispatch, ...props }) => {
    if (myAddress) {
      dispatch(fetchSpaceIdsOwnedByAccount({ id: myAddress, reload: true, ...props }))
      dispatch(fetchEntityOfSpaceIdsByFollower({ id: myAddress, reload: true, ...props }))
    }
  })
}

/** Select two lists of space ids: that I own, I gave any role */
export const useSelectSpaceIdsWhereAccountCanPost = (address?: AccountId) => {
  return useAppSelector(state => {
    if (!address) return []

    const ownSpaceIds = selectSpaceIdsByOwner(state, address) || []
    const spaceIdsWithRolesByAccount = selectSpaceIdsWithRolesByAccount(state, address) || []
    const ids = [...new Set([...ownSpaceIds, ...spaceIdsWithRolesByAccount])]
    const spaces = selectSpaces(state, { ids })

    const spacesMap = new Map<string, SpaceWithSomeDetails>()
    spaces.forEach(space => spacesMap.set(space.id, space))

    return ids.filter(id => {
      const space = spacesMap.get(id)
      return !space?.struct.hidden
    })
  }, shallowEqual)
}

export const useSelectSpaceIdsWhereAccountCanPostWithLoadingStatus = (address?: AccountId) =>
  useAppSelector(state => {
    if (!address) return { isLoading: false, spaceIds: [] }

    const ownSpaceIds = selectEntityOfSpaceIdsByOwner(state, { id: address })
    const isLoading = !ownSpaceIds
    const spaceIdsWithRolesByAccount = selectSpaceIdsWithRolesByAccount(state, address) || []

    return {
      isLoading,
      spaceIds: [...new Set([...(ownSpaceIds?.ownSpaceIds ?? []), ...spaceIdsWithRolesByAccount])],
    }
  }, shallowEqual)
