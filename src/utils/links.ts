import { SpaceData } from '@subsocial/api/types'
import { getSpaceHandleOrId } from './spaces'

export const getSubsocialDiscordLink = () => 'https://discord.com/invite/w2Rqy2M'

export const getSubIdCreatorsLink = (space?: SpaceData) =>
  `https://sub.id/creators/${space ? getSpaceHandleOrId(space.struct) : ''}`
