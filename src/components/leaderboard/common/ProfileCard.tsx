import clsx from 'clsx'
import { IoPeople } from 'react-icons/io5'
import { ReactNode } from 'react-markdown'
import Avatar from 'src/components/profiles/address-views/Avatar'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import ViewSpaceLink from 'src/components/spaces/ViewSpaceLink'
import DfCard, { DfCardProps } from 'src/components/utils/cards/DfCard'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { truncateAddress } from 'src/utils/storage'
import styles from './ProfileCard.module.sass'

export type ProfileCardProps = DfCardProps & {
  address?: string
  title?: string
  detail?: ReactNode
}

export default function ProfileCard({ address, title, detail, ...props }: ProfileCardProps) {
  const isMobile = useIsMobileWidthOrDevice()
  const profile = useSelectProfile(address)

  const usedTitle = title || (profile?.content?.name ?? truncateAddress(address ?? ''))
  const size = isMobile ? 70 : 88

  const avatar = (
    <Avatar
      asLink={false}
      size={size}
      address={address ?? ''}
      avatar={profile?.content?.image}
      noMargin
    />
  )
  const name = <span className={clsx(styles.ProfileName)}>{usedTitle}</span>

  return (
    <DfCard
      {...props}
      className={clsx(styles.ProfileCard, props.className)}
      style={{ minWidth: 0, ...props.style }}
      size='small'
      withShadow={false}
    >
      {address ? (
        profile?.struct ? (
          <ViewSpaceLink space={profile?.struct} title={avatar} />
        ) : (
          avatar
        )
      ) : (
        <div
          className='rounded-circle d-flex align-items-center justify-content-center'
          style={{ background: 'white', width: `${size}px`, height: `${size}px` }}
        >
          <IoPeople style={{ fontSize: '42px', color: '#5089F8' }} />
        </div>
      )}
      <div className={clsx(styles.ProfileContent)} style={{ maxWidth: '100%', minWidth: 0 }}>
        {profile ? <ViewSpaceLink space={profile.struct} title={name} /> : name}
        {profile?.content?.about && (
          <p
            className='my-1 ColorMuted FontSmall'
            style={{
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {profile.content.about}
          </p>
        )}
        {detail}
      </div>
    </DfCard>
  )
}
