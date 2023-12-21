import { SpaceStruct } from '@subsocial/api/types'

export function getSpaceHandleOrId(spaceStruct?: SpaceStruct) {
  return spaceStruct?.handle || spaceStruct?.id
}
