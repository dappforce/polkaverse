import config from 'src/config'
import MultiBanner from './MultiBanner'

const bannersKind = ['blue', 'white', 'pink']

const BANNER_STORAGE_KEY = 'df.banner'

export const DomainsBanner = () => (
  <MultiBanner
    uid={BANNER_STORAGE_KEY}
    kinds={bannersKind}
    href={`${config.appBaseUrl}/dd/register`}
    buildUrl={({ kind, isMobile }) =>
      `/images/banners/${kind}-domains${isMobile ? '-mobile' : ''}.png`
    }
  />
)

export default DomainsBanner
