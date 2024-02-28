import { HourglassOutlined } from '@ant-design/icons'
import { Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import { MdVerified } from 'react-icons/md'
import CustomLink from 'src/components/referral/CustomLink'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import messages from 'src/messages'
import { SpaceStruct } from 'src/types'
import { isClaimedSpace, isOfficialSpace } from 'src/utils'
import styles from '../spaces.module.sass'

type OfficialSpaceStatusProps = {
  space: SpaceStruct
  className?: string
  withoutContainer?: boolean
}

type InnerIconProps = {
  title: string
  icon: JSX.Element
}

const officialSpaceIcon = <MdVerified className={styles.ClaimedOfficialSpaceIcon} />

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
  <CustomLink href={claimSpaceUrl} as={claimSpaceUrl}>
    <Tag color='gold' className='DfClaimSpaceTag'>
      Claim space
    </Tag>
  </CustomLink>
)

export const OfficialSpaceStatus = ({
  space,
  className,
  withoutContainer,
}: OfficialSpaceStatusProps) => {
  const isMobile = useIsMobileWidthOrDevice()

  if (!isOfficialSpace(space.id)) return null

  const isClaimed = isClaimedSpace(space)

  const { title, icon } = isClaimed ? officialSpaceProps : unclaimedSpaceProps

  const content = (
    <>
      <Tooltip title={title} className={clsx('mr-2', className)}>
        {icon}
      </Tooltip>
      {!isClaimed && !isMobile && claimSpaceLink}
    </>
  )

  if (withoutContainer) {
    return content
  }

  return <span className={clsx('d-flex align-items-center', className)}>{content}</span>
}
