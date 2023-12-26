import { SpaceData } from '@subsocial/api/types'
import { getSpaceHandleOrId } from './spaces'

export const getSubsocialDiscordLink = () => 'https://discord.com/invite/w2Rqy2M'

export const getSubIdCreatorsLink = (space?: SpaceData) =>
  `https://sub.id/creators/${space ? getSpaceHandleOrId(space.struct) : ''}`

const activeStakingLinks = {
  learnMore:
    'https://polkaverse.com/@subsocial/boost-staking-rewards-by-up-to-3x-in-the-active-staking-40404',
  discuss: 'https://grill.chat/creators/stakers-20132?wallet=talisman',
}
export const getActiveStakingLinks = () => activeStakingLinks
