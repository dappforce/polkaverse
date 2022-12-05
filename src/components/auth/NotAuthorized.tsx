import NoData from '../utils/EmptyList'
import { SignInButton } from './AuthButtons'

export const NotAuthorized = () => (
  <NoData description='Only signed in users can access this page'>
    <SignInButton />
  </NoData>
)

export default NotAuthorized
