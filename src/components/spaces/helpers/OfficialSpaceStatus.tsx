import { CheckCircleFilled, HourglassOutlined } from '@ant-design/icons'
import { Tag, Tooltip } from 'antd'
import Link from 'next/link'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import messages from 'src/messages'
import { SpaceStruct } from 'src/types'
import { isClaimedSpace, isOfficialSpace } from 'src/utils'
import styles from '../spaces.module.sass'

type OfficialSpaceStatusProps = {
  space: SpaceStruct
}

type InnerIconProps = {
  title: string
  icon: JSX.Element
}

const officialSpaceIcon = <CheckCircleFilled className={styles.ClaimedOfficialSpaceIcon} />

const unclaimedSpaceIcon = <HourglassOutlined className={styles.ClaimSpacePendingIcon} />

const officialSpaceProps: InnerIconProps = {
  title: messages.spaces.offical.officialSpace,
  icon: officialSpaceIcon,
}

const unclaimedSpaceProps: InnerIconProps = {
  title: messages.spaces.offical.unclaimedSpace,
  icon: unclaimedSpaceIcon,
}

const claimSpaceUrl = '/spaces/claim'

const claimSpaceLink = (
  <Link href={claimSpaceUrl} as={claimSpaceUrl}>
    <Tag color='gold' className='DfClaimSpaceTag'>
      Claim space
    </Tag>
  </Link>
)

export const OfficialSpaceStatus = ({ space }: OfficialSpaceStatusProps) => {
  const isMobile = useIsMobileWidthOrDevice()

  if (!isOfficialSpace(space.id)) return null

  const isClaimed = isClaimedSpace(space)

  const { title, icon } = isClaimed ? officialSpaceProps : unclaimedSpaceProps

  return (
    <span className='d-flex align-items-center'>
      <Tooltip title={title} className='mr-2'>
        {icon}
      </Tooltip>
      {!isClaimed && !isMobile && claimSpaceLink}
    </span>
  )
}
