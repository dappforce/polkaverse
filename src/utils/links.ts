import { getCurrentWallet } from 'src/components/auth/utils'

export const getSubsocialDiscordLink = () => 'https://discord.com/invite/w2Rqy2M'

export const getSubIdCreatorsLink = () => 'https://sub.id/creators'

export const activeStakingLinks = {
  learnMore: 'https://docs.subsocial.network/docs/basics/creator-staking/active-staking',
  discuss: () => {
    const currentWallet = getCurrentWallet()
    const link = 'https://grill.chat/creators/stakers-20132'
    if (!currentWallet) return link
    return `${link}?wallet=${currentWallet}`
  },
}
