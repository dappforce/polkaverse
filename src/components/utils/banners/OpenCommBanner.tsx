import MultiBanner from './MultiBanner'

const bannersKind = ['']

const BANNER_STORAGE_KEY = 'df.open-comm-banner'

const href = 'https://polkadot.polkassembly.io/referenda/119'

export const OpenCommBanner = () => (
  <MultiBanner
    uid={BANNER_STORAGE_KEY}
    kinds={bannersKind}
    href={href}
    buildUrl={({ isMobile }) => `/images/banners/open-comm${isMobile ? '-mobile' : '-desktop'}.png`}
  />
)

export default OpenCommBanner
