import { Button } from 'antd'
import { redirectToLogin } from 'src/utils/url'
import NoData from '../utils/EmptyList'

export const NotAuthorized = () => (
  <NoData description='Only signed in users can access this page'>
    <Button onClick={() => redirectToLogin()}>Sign in</Button>
  </NoData>
)

export default NotAuthorized
