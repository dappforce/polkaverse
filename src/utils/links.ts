import { SpaceData } from '@subsocial/api/types'
import { getCurrentWallet } from 'src/components/auth/utils'
import { getSpaceHandleOrId } from './spaces'

export const getSubsocialDiscordLink = () => 'https://discord.com/invite/w2Rqy2M'

export const getSubIdCreatorsLink = (space?: SpaceData) =>
  `https://sub.id/creators/${space ? getSpaceHandleOrId(space.struct) : ''}`

export const activeStakingLinks = {
  learnMore: 'https://subsocial.network/active-staking-details',
  discuss: () => {
    const currentWallet = getCurrentWallet()
    const link = 'https://grill.chat/creators/stakers-20132'
    if (!currentWallet) return link
    return `${link}?wallet=${currentWallet}`
  },
}
