import { SignOutButton } from 'src/components/auth/AuthButtons'
import { AccountSelector } from './AccountSelector'
// import PrivacyPolicyLinks from '../utils/PrivacyPolicyLinks'
import { Divider } from 'antd'

export const MyAccountSection = () => {
  return (
    <div>
      <AccountSelector />
      <Divider className='mb-3 mt-0' />
      <SignOutButton />
      {/* <Divider className='mt-3 mb-0' />
    <PrivacyPolicyLinks /> */}
    </div>
  )
}

export default MyAccountSection
