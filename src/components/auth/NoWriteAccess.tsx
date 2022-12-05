import { Result } from 'antd'
import Link from 'next/link'

export const NoWriteAccess = () => (
  <Result
    status='warning'
    subTitle={
      <>
        <p>
          {
            'Your account has been restricted from creating new spaces, posts, and comments, on this particular website due to a violation in our '
          }
          <Link href='/legal/terms'>Terms of Use</Link>
          {'.'}
        </p>
        <p>
          {
            'You can continue following, reading, and upvoting the posts from this website, but not create new content as previously outlined. As Subsocial Network is a decentralized protocol, your account can still create content via another website or service which has not restricted your access.'
          }
        </p>
      </>
    }
  />
)

export default NoWriteAccess
