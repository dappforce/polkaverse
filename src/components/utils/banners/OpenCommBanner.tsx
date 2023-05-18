import MultiBanner from './MultiBanner'

const bannersKind = ['robot', 'polka']

const BANNER_STORAGE_KEY = 'df.opencomm-banner'

const href = 'https://kusama.subsquare.io/referenda/referendum/198'

export const OpenCommBanner = () => (
  <MultiBanner
    uid={BANNER_STORAGE_KEY}
    kinds={bannersKind}
    href={href}
    buildUrl={({ kind, isMobile }) =>
      `/images/banners/${kind}-opencomm${isMobile ? '-mobile' : ''}.png`
    }
  />
)

export default OpenCommBanner
