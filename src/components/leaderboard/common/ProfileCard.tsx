import clsx from 'clsx'
import { ComponentProps } from 'react'
import { IoPeople } from 'react-icons/io5'
import Avatar from 'src/components/profiles/address-views/Avatar'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import DfCard from 'src/components/utils/cards/DfCard'
import { MutedSpan } from 'src/components/utils/MutedText'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { truncateAddress } from 'src/utils/storage'
import styles from './ProfileCard.module.sass'

export type ProfileCardProps = ComponentProps<'div'> & {
  address?: string
  title?: string
  subtitle: string
}

export default function ProfileCard({ address, title, subtitle, ...props }: ProfileCardProps) {
  const isMobile = useIsMobileWidthOrDevice()
  const profile = useSelectProfile(address)

  const usedTitle = title || (profile?.content?.name ?? truncateAddress(address ?? ''))
  const size = isMobile ? 70 : 88

  return (
    <DfCard
      {...props}
      className={clsx(styles.ProfileCard, props.className)}
      size='small'
      variant='info'
      withShadow={false}
    >
      {address ? (
        <Avatar size={size} address={address} avatar={profile?.content?.image} noMargin />
      ) : (
        <div
          className='rounded-circle d-flex align-items-center justify-content-center'
          style={{ background: 'white', width: `${size}px`, height: `${size}px` }}
        >
          <IoPeople style={{ fontSize: '42px', color: '#5089F8' }} />
        </div>
      )}
      <div className={clsx(styles.ProfileContent)}>
        <span className={clsx(styles.ProfileName)}>{usedTitle}</span>
        <MutedSpan>{subtitle}</MutedSpan>
      </div>
    </DfCard>
  )
}
