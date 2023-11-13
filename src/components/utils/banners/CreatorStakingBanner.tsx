import MultiBanner from './MultiBanner'

const bannersKind = ['']

const BANNER_STORAGE_KEY = 'df.creators-staking'

const href = 'https://sub.id/creators'

export const StakingBanner = () => (
  <MultiBanner
    uid={BANNER_STORAGE_KEY}
    kinds={bannersKind}
    href={href}
    buildUrl={({ isMobile }) =>
      `/images/banners/creator-staking${isMobile ? '-mobile' : '-desktop'}.png`
    }
  />
)

export default StakingBanner
