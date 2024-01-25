import { CheckOutlined } from '@ant-design/icons'
import { Button, ButtonProps, Tooltip } from 'antd'
import clsx from 'clsx'
import capitalize from 'lodash/capitalize'
import dynamic from 'next/dynamic'
import React from 'react'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { SpaceContent, SpaceId, SpaceWithSomeDetails } from 'src/types'
import { getAmountRange } from 'src/utils/analytics'
import { useSelectSpace } from '../../rtk/features/spaces/spacesHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import { useAmISpaceFollower } from '../utils/FollowSpaceButton'
import { SummarizeMd } from '../utils/md'
import { MutedDiv } from '../utils/MutedText'
import { useIsUnlistedSpace } from './helpers/common'
import { SpaceAvatar } from './helpers/SpaceAvatar'
import styles from './spaces.module.sass'
import { renderSpaceName } from './ViewSpace'
import ViewSpaceLink from './ViewSpaceLink'

const FollowSpaceButton = dynamic(() => import('../utils/FollowSpaceButton'), { ssr: false })

type CommonSpacePreviewProps = {
  noLink?: boolean
  customFollowButton?: {
    onClick: (space: SpaceWithSomeDetails, action: 'follow' | 'unfollow') => void
    buttonProps?: Omit<ButtonProps, 'onClick' | 'children'>
    isFollowed?: (spaceId: string) => boolean
  }
}

export type SpacePreviewProps = {
  space: SpaceWithSomeDetails
  withFollowButton?: boolean
} & CommonSpacePreviewProps

export const SpacePreview = ({
  space: spaceData,
  withFollowButton = true,
  customFollowButton,
  noLink,
}: SpacePreviewProps) => {
  const address = useMyAddress()
  const sendEvent = useSendEvent()
  const { data: totalStake } = useFetchTotalStake(address ?? '')
  const { id: spaceProfileId } = useSelectProfile(address) || {}

  const isCurrentProfile = spaceData.id === spaceProfileId

  if (useIsUnlistedSpace(spaceData)) {
    return null
  }

  const currentProfileLabel = isCurrentProfile ? (
    <Tooltip title='Current profile'>
      <CheckOutlined className={styles.CurrentProfile} />
    </Tooltip>
  ) : null

  const { struct: space, content = {} as SpaceContent } = spaceData

  const { image } = content

  const Avatar = () => <SpaceAvatar space={space} avatar={image} size={46} />

  const spaceName = renderSpaceName(spaceData)

  return (
    <div className='d-flex align-items-center justify-content-between'>
      <div className='d-flex align-items-center'>
        <div>
          <Avatar />
        </div>
        <div className='text-left'>
          <div className='font-weight-bold'>
            {' '}
            {noLink ? spaceName : <ViewSpaceLink space={space} title={spaceName} />}
          </div>
          <MutedDiv>
            <SummarizeMd
              className={clsx(styles.About, { [styles.WithoutButton]: !withFollowButton })}
              content={content}
              style={{ color: 'currentColor' }}
            />
          </MutedDiv>
        </div>
      </div>
      {(() => {
        if (withFollowButton) {
          if (customFollowButton) {
            return (
              <CustomFollowButton
                {...customFollowButton.buttonProps}
                isFollowed={customFollowButton.isFollowed}
                spaceId={spaceData.id}
                onClick={type => customFollowButton.onClick(spaceData, type)}
              />
            )
          }
          return (
            <div
              className='ml-2'
              onClick={() =>
                sendEvent('follow', {
                  spaceId: space.id,
                  eventSource: 'home',
                  amountRange: getAmountRange(totalStake?.amount),
                })
              }
            >
              <FollowSpaceButton space={space} />
            </div>
          )
        }
        return currentProfileLabel
      })()}
    </div>
  )
}

export type LineSpacePreviewProps = {
  spaceId: SpaceId
  withFollowButton?: boolean
  shouldDisplayFollowedSpaces?: boolean
} & CommonSpacePreviewProps

export const LineSpacePreview = React.memo(
  ({
    spaceId,
    shouldDisplayFollowedSpaces = true,
    withFollowButton = true,
    ...otherProps
  }: LineSpacePreviewProps) => {
    const space = useSelectSpace(spaceId)
    const isFollower = useAmISpaceFollower(spaceId)

    if (!space || (!shouldDisplayFollowedSpaces && isFollower)) return null

    return <SpacePreview space={space} withFollowButton={withFollowButton} {...otherProps} />
  },
)

type CustomFollowButtonProps = Omit<ButtonProps, 'children' | 'onClick'> & {
  onClick: (type: 'follow' | 'unfollow') => void
  isFollowed?: (spaceId: string) => boolean
  spaceId: string
}
function CustomFollowButton({ spaceId, onClick, isFollowed, ...props }: CustomFollowButtonProps) {
  const isFollower = useAmISpaceFollower(spaceId)
  const type = isFollower || (isFollowed && isFollowed(spaceId)) ? 'unfollow' : 'follow'
  return (
    <Button
      type={type === 'unfollow' ? 'default' : 'primary'}
      {...props}
      onClick={() => onClick(type)}
    >
      {capitalize(type)}
    </Button>
  )
}
