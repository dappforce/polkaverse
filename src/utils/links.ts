import { getCurrentWallet } from 'src/components/auth/utils'

export const getSubsocialDiscordLink = () => 'https://discord.com/invite/w2Rqy2M'

export const getContentStakingLink = () =>
  `${typeof window ? '' : window.location.origin}/c/staking`

export const activeStakingLinks = {
  learnMore: 'https://docs.subsocial.network/docs/basics/content-staking/content-staking',
  discuss: () => {
    const currentWallet = getCurrentWallet()
    const link = 'https://grillapp.net/c/subsocial/grill-official-54469'
    if (!currentWallet) return link
    return `${link}?wallet=${currentWallet}`
  },
}
