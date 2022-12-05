import { EditOutlined, NotificationOutlined } from '@ant-design/icons'
import { AnyAccountId } from '@subsocial/api/types'
import { Tag } from 'antd'
import clsx from 'clsx'
import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { Donate } from 'src/components/donate'
import Name from 'src/components/profiles/address-views/Name'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import { editSpaceUrl } from 'src/components/urls'
import CardWithContent, { CardWithContentProps } from 'src/components/utils/cards/CardWithContent'
import { ButtonLink } from 'src/components/utils/CustomLinks'
import { DfMd } from 'src/components/utils/DfMd'
import FollowAccountButton from 'src/components/utils/FollowAccountButton'
import { useSelectProfile } from 'src/rtk/app/hooks'
import Avatar from './Avatar'

export interface AuthorCardProps
  extends Omit<CardWithContentProps, 'avatarProps' | 'title' | 'subtitle' | 'actions'> {
  address: string | AnyAccountId
  withAuthorTag?: boolean
  withTipButton?: boolean
}

export default function AuthorCard({
  address,
  withAuthorTag,
  withTipButton,
  ...props
}: AuthorCardProps) {
  const profile = useSelectProfile(address.toString())
  const accountAvatar = profile?.content?.image
  const isMobile = useIsMobileWidthOrDevice()
  const isMy = useIsMyAddress(address)

  return (
    <CardWithContent
      {...props}
      avatar={<Avatar address={address} avatar={accountAvatar} size={64} />}
      title={
        <div className={clsx('d-flex', isMobile ? 'flex-column' : 'align-items-center')}>
          <Name asLink owner={profile} address={address} />
          <div className='FontNormal'>
            {withAuthorTag && (
              <Tag
                color='blue'
                className={clsx(isMobile ? 'mb-2' : 'ml-2')}
                icon={<NotificationOutlined />}
              >
                <span className='font-weight-normal'>Post author</span>
              </Tag>
            )}
          </div>
        </div>
      }
      subtitle={<DfMd source={profile?.content?.about} className='ColorCurrentColor' />}
      actions={
        <div className='d-flex align-items-center'>
          {withTipButton && !isMy && <Donate recipientAddress={address.toString()} />}
          {isMy && profile && (
            <ButtonLink
              href={'/[spaceId]/edit'}
              as={editSpaceUrl(profile.struct)}
              className='bg-transparent'
            >
              <EditOutlined /> Edit
            </ButtonLink>
          )}
          <FollowAccountButton address={address} />
        </div>
      }
    />
  )
}
