import { EditOutlined, NotificationOutlined } from '@ant-design/icons'
import { AnyAccountId } from '@subsocial/api/types'
import { Tag } from 'antd'
import clsx from 'clsx'
import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { Donate } from 'src/components/donate'
import Name from 'src/components/profiles/address-views/Name'
import { useResponsiveSize } from 'src/components/responsive'
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
  const { isSmallMobile } = useResponsiveSize()
  const isMyAddress = useIsMyAddress(address)

  return (
    <CardWithContent
      {...props}
      avatar={<Avatar noMargin address={address} avatar={accountAvatar} size={64} />}
      title={
        <div
          className={clsx(
            isSmallMobile
              ? 'd-flex align-items-center flex-column mx-auto'
              : 'VertAlignMiddleChildren',
          )}
        >
          <Name
            asLink
            owner={profile}
            address={address}
            className='UnboundedFont font-weight-normal'
          />
          <span className='FontNormal'>
            {withAuthorTag && (
              <Tag
                color='blue'
                className={clsx('mr-0', isSmallMobile ? 'mb-2' : 'ml-2')}
                icon={<NotificationOutlined />}
              >
                <span className='font-weight-normal'>Post author</span>
              </Tag>
            )}
          </span>
        </div>
      }
      subtitle={<DfMd source={profile?.content?.about} className='ColorCurrentColor FontSmall' />}
      buttons={[
        withTipButton && !isMyAddress && (
          <Donate key='donate' recipientAddress={address.toString()} />
        ),
        isMyAddress && profile && (
          <ButtonLink
            key='edit'
            href={editSpaceUrl(profile.struct, true)}
            className='bg-transparent'
          >
            <EditOutlined /> Edit
          </ButtonLink>
        ),
        <FollowAccountButton key='follow' address={address} />,
      ]}
    />
  )
}
