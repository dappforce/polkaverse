import MultiBanner from './MultiBanner'

const bannersKind = ['']

const BANNER_STORAGE_KEY = 'df.creators-staking'

const href = 'https://subsocial.network/get-sub'

export const GetSub = () => (
  <MultiBanner
    uid={BANNER_STORAGE_KEY}
    kinds={bannersKind}
    href={href}
    buildUrl={({ isMobile }) => `/images/banners/sub${isMobile ? '-mobile' : '-desktop'}.png`}
  />
)

export default GetSub
