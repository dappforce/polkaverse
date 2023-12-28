import { SpaceData } from '@subsocial/api/types'
import { getCurrentWallet } from 'src/components/auth/utils'
import { getSpaceHandleOrId } from './spaces'

export const getSubsocialDiscordLink = () => 'https://discord.com/invite/w2Rqy2M'

export const getSubIdCreatorsLink = (space?: SpaceData) =>
  `https://sub.id/creators/${space ? getSpaceHandleOrId(space.struct) : ''}`

export const activeStakingLinks = {
  learnMore:
    'https://polkaverse.com/@subsocial/boost-staking-rewards-by-up-to-3x-in-the-active-staking-40404',
  discuss: () => {
    const currentWallet = getCurrentWallet()
    const link = 'https://grill.chat/creators/stakers-20132'
    if (!currentWallet) return link
    return `${link}?wallet=${currentWallet}`
  },
}
