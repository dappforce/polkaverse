import MultiBanner from './MultiBanner'

const bannersKind = ['']

const BANNER_STORAGE_KEY = 'df.comments'

const CommentBanner = () => (
  <MultiBanner
    uid={BANNER_STORAGE_KEY}
    kinds={bannersKind}
    withCloseButtonBackground
    buildUrl={({ isMobile }) => `/images/banners/comment${isMobile ? '-mobile' : '-desktop'}.png`}
  />
)

export default CommentBanner
