import { Button } from 'antd'
import CustomLink from '../referral/CustomLink'
import CustomModal from '../utils/CustomModal'
import { APPEAL_LINK, CONTENT_POLICY_LINK } from './utils'

export default function BlockedModal({ ...props }: { visible: boolean; onCancel: () => void }) {
  return (
    <CustomModal
      {...props}
      title={
        <span>
          Your account was blocked due to a violation of{' '}
          <CustomLink href={CONTENT_POLICY_LINK}>Grill&apos;s content policy.</CustomLink>
        </span>
      }
      subtitle='You are now restricted from taking actions on Grill, but can still manage your locked SUB, and use other applications running on the Subsocial network.'
    >
      <div className='GapNormal' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <CustomLink href='/c/staking'>
          <Button size='large' type='primary' className='w-100'>
            Manage SUB
          </Button>
        </CustomLink>
        <CustomLink href={APPEAL_LINK}>
          <Button size='large' className='w-100'>
            Appeal
          </Button>
        </CustomLink>
      </div>
    </CustomModal>
  )
}
