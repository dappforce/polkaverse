import { Alert } from 'antd'
import CustomLink from '../referral/CustomLink'
import { CONTENT_POLICY_LINK } from './utils'

export default function BlockedAlert({ customPrefix = 'This account' }: { customPrefix?: string }) {
  return (
    <Alert
      type='warning'
      message={
        <span>
          {customPrefix} was blocked due to a violation of{' '}
          <CustomLink href={CONTENT_POLICY_LINK}>Grill&apos;s content policy.</CustomLink>
        </span>
      }
    />
  )
}
