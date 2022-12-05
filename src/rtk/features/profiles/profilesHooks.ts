import { useActions } from 'src/rtk/app/helpers'
import { useFetch, useFetchEntity, useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { AccountId, ProfileData } from 'src/types'
import { useSelectSpace } from '../spaces/spacesHooks'
import {
  fetchEntityOfAccountIdsByFollower,
  selectEntityOfAccountIdsByFollower,
} from './followedAccountIdsSlice'
import {
  fetchProfileSpaces,
  SelectProfileArgs,
  SelectProfilesArgs,
  selectProfileSpaceStructById,
} from './profilesSlice'

export const useSelectProfileSpace = (accountId?: AccountId) =>
  useAppSelector(state => (accountId ? selectProfileSpaceStructById(state, accountId) : undefined))

export const useSelectProfile = (accountId?: AccountId): ProfileData | undefined => {
  const profileSpaceByAccount = useSelectProfileSpace(accountId)

  const profileSpace = useSelectSpace(profileSpaceByAccount?.spaceId)
  const { struct, content } = profileSpace || {}

  if (!struct || !content) return undefined

  return profileSpace
}

export const useFetchProfileSpace = (args: SelectProfileArgs) => {
  return useFetchEntity(useSelectProfile, fetchProfileSpaces, args)
}

export const useFetchProfileSpaces = (args: SelectProfilesArgs) => {
  return useFetch(fetchProfileSpaces, args)
}

export const useCreateReloadProfile = () => {
  return useActions<SelectProfileArgs>(({ dispatch, api, args: { id } }) =>
    dispatch(fetchProfileSpaces({ api, ids: [id], reload: true })),
  )
}

export const useFetchAccountIdsByFollower = (follower: AccountId) => {
  return useFetchOneEntity(selectEntityOfAccountIdsByFollower, fetchEntityOfAccountIdsByFollower, {
    id: follower,
  })
}

export const useCreateReloadAccountIdsByFollower = () => {
  return useActions<AccountId>(({ dispatch, args: id, ...props }) => {
    dispatch(fetchEntityOfAccountIdsByFollower({ id, reload: true, ...props }))
  })
}
