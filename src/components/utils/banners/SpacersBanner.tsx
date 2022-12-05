import MultiBanner from './MultiBanner'

export const SpacersBanner = () => (
  <MultiBanner
    uid={'df.spacers-banner'}
    kinds={[]}
    href={'https://pods.spacers.app'}
    buildUrl={({ isMobile }) =>
      `/images/banners/${isMobile ? 'spacers-mobile' : 'spacers-desktop'}.jpg`
    }
  />
)

export default SpacersBanner
