import { Col, Row } from 'antd'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import React, { FC } from 'react'
import { Pluralize } from 'src/components/utils/Plularize'
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config'
import { ProfileData } from 'src/types'
import { useSelectProfile } from '../../../rtk/features/profiles/profilesHooks'
import { AccountFollowersModal, AccountFollowingModal } from '../AccountsListModal'
import Avatar from './Avatar'
import ProfileChip from './NameChip'
import { CreateOrEditProfileSpace } from './utils/index'
import NameDetails from './utils/NameDetails'
import { AddressProps } from './utils/types'
import { withMyProfile, withProfileByAccountId } from './utils/withLoadedOwner'

const FollowAccountButton = dynamic(() => import('../../utils/FollowAccountButton'), { ssr: false })

type ProfilePreviewProps = AddressProps & {
  withLabel?: boolean
  withDetails?: boolean
  size?: number
  left?: React.ReactNode
  right?: React.ReactNode
  bottom?: React.ReactNode
  spans?: {
    avatar?: number
    main?: number
    right?: number
  }
}

export const ProfilePreview: FC<ProfilePreviewProps> = ({
  address,
  withLabel,
  className,
  owner = {} as ProfileData,
  size,
  withDetails,
  left,
  right,
  bottom,
  spans,
}) => {
  console.log({ spans })
  return (
    <Row className={clsx('flex-nowrap', 'align-items-center', className)}>
      <Col>
        {left}
        <Avatar size={size || LARGE_AVATAR_SIZE} address={address} avatar={owner?.content?.image} />
      </Col>
      <Col span={spans?.main} className='ProfilePreview-Main'>
        <NameDetails
          owner={owner}
          address={address}
          withLabel={withLabel}
          withDetails={withDetails}
        />
        {bottom}
      </Col>
      <Col span={spans?.right} className='ProfilePreview-Right'>
        {right}
      </Col>
    </Row>
  )
}

export const ProfilePreviewPopup: FC<ProfilePreviewProps> = props => {
  const { address, withDetails = false, bottom } = props

  return (
    <ProfilePreview
      {...props}
      bottom={
        <>
          {withDetails && (
            <>
              <div className='DfPopup-links'>
                <AccountFollowersModal
                  address={address}
                  pluralizeTitle='Follower'
                  renderOpenButton={(open, count) => (
                    <div
                      onClick={open}
                      className={clsx('DfPopup-link NoWordBreak FontSmall', count ? '' : 'disable')}
                    >
                      <Pluralize count={count} singularText='Follower' />
                    </div>
                  )}
                />
                <AccountFollowingModal
                  address={address}
                  pluralizeTitle='Following'
                  renderOpenButton={(open, count) => (
                    <div
                      onClick={open}
                      className={`DfPopup-link NoWordBreak FontSmall ${count ? '' : 'disable'}`}
                    >
                      <Pluralize count={count} singularText='Following' />
                    </div>
                  )}
                />
              </div>
              <CreateOrEditProfileSpace address={address} className='DfGreyLink FontNormal mb-2' />
            </>
          )}
          {bottom}
        </>
      }
      right={
        <Row justify='end' align='top'>
          <FollowAccountButton address={address} />
        </Row>
      }
    />
  )
}

type ProfilePreviewByIdProps = ProfilePreviewProps & {
  withFollowButton?: boolean
  withProfileChip?: boolean
}

export const ProfilePreviewById = (props: ProfilePreviewByIdProps) => {
  const owner = useSelectProfile(props.address.toString())

  const right = props.withFollowButton ? (
    <Row justify='end' align='top'>
      <FollowAccountButton address={props.address} />
    </Row>
  ) : null

  const chipRight = props.withProfileChip ? (
    <Row justify='end' align='top'>
      <ProfileChip>Email</ProfileChip>
    </Row>
  ) : null

  return <ProfilePreview owner={owner} right={right || chipRight} {...props} />
}

export const ProfilePreviewByAccountId = withProfileByAccountId(ProfilePreview)

export default ProfilePreviewByAccountId

export const MyProfilePreview = withMyProfile(ProfilePreview)
