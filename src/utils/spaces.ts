import { SpaceStruct } from '@subsocial/api/types'

export function getSpaceHandleOrId(spaceStruct?: SpaceStruct) {
  let handleOrId = spaceStruct?.handle
  if (handleOrId) handleOrId = `@${handleOrId}`

  return handleOrId || spaceStruct?.id
}
