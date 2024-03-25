import { isEmptyArray } from '@subsocial/utils'
import { useFetchSpaceEditors } from 'src/rtk/features/accounts/accountsHooks'
import { SpaceStruct } from 'src/types'

export type BuiltInRole = 'none' | 'everyone' | 'follower' | 'space_owner'

export const getWhoCanPost = (space?: SpaceStruct): BuiltInRole => {
  if (!space) return 'space_owner'

  const { canEveryoneCreatePosts, canFollowerCreatePosts } = space

  if (canFollowerCreatePosts) return 'follower'

  if (canEveryoneCreatePosts) return 'everyone'

  return 'space_owner'
}

type Function = (editors: string[]) => string

export const permissionsState: Record<string, string | Function> = {
  follower: 'You and all followers of this space can post here',
  everyone: 'Everyone can post here',
  space_owner: 'Only you can post here',
  editors: (editors: string[]) =>
    `You and ${editors.length} selected editor accounts can post here`,
}

export const useGetSpacePermissionsConfig = (space?: SpaceStruct) => {
  const whoCanPost = getWhoCanPost(space)

  const { spaceEditors: editors = [] } = useFetchSpaceEditors(space?.id || '')

  return isEmptyArray(editors) ? whoCanPost : 'editors'
}
