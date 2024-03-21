import { Alert } from 'antd'
import CustomLink from '../referral/CustomLink'

export default function BlockedAlert({ customPrefix = 'This account' }: { customPrefix?: string }) {
  return (
    <Alert
      type='warning'
      message={
        <span>
          {customPrefix} was blocked due to a violation of{' '}
          <CustomLink href='https://grillapp.net/legal/content-policy'>
            Grill&apos;s content policy.
          </CustomLink>
        </span>
      }
    />
  )
}
