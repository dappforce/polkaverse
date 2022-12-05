import { SpaceStruct } from 'src/types'

export type BuiltInRole = 'none' | 'everyone' | 'follower' | 'space_owner'

export const getWhoCanPost = (space?: SpaceStruct): BuiltInRole => {
  if (!space) return 'space_owner'

  const { canEveryoneCreatePosts, canFollowerCreatePosts } = space

  if (canFollowerCreatePosts) return 'follower'

  if (canEveryoneCreatePosts) return 'everyone'

  return 'space_owner'
}
