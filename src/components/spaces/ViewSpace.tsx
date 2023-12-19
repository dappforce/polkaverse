import { EditOutlined } from '@ant-design/icons'
import { isEmptyStr, newLogger, nonEmptyStr } from '@subsocial/utils'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import React, { MouseEvent, useCallback, useState } from 'react'
import { ButtonLink } from 'src/components/utils/CustomLinks'
import { Segment } from 'src/components/utils/Segment'
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config'
import { SpaceContent, SpaceId, SpaceWithSomeDetails } from 'src/types'
import config from '../../config'
import { useSelectProfileSpace } from '../../rtk/features/profiles/profilesHooks'
import { useSelectSpace } from '../../rtk/features/spaces/spacesHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import StakeSubBanner from '../creators/StakeSubBanner'
import MakeAsProfileModal from '../profiles/address-views/utils/MakeAsProfileModal'
import { useIsMobileWidthOrDevice } from '../responsive'
import { editSpaceUrl } from '../urls'
import { DfMd } from '../utils/DfMd'
import { EntityStatusGroup, PendingSpaceOwnershipPanel } from '../utils/EntityStatusPanels'
import { SummarizeMd } from '../utils/md'
import { MutedSpan } from '../utils/MutedText'
import MyEntityLabel from '../utils/MyEntityLabel'
import Section from '../utils/Section'
import { BareProps } from '../utils/types'
import ViewTags from '../utils/ViewTags'
import {
  HiddenSpaceAlert,
  OfficialSpaceStatus,
  PostPreviewsOnSpace,
  SpaceAvatar,
  SpaceDropdownMenu,
  useIsMySpace,
  useIsUnlistedSpace,
} from './helpers'
import { ContactInfo } from './SocialLinks/ViewSocialLinks'
import SpaceStatsRow from './SpaceStatsRow'
import ViewSpaceLink from './ViewSpaceLink'
import { ViewSpaceOptsProps, ViewSpaceProps } from './ViewSpaceProps'

const log = newLogger('ViewSpace')

const FollowSpaceButton = dynamic(() => import('../utils/FollowSpaceButton'), { ssr: false })

type Props = ViewSpaceProps

export const renderSpaceName = (space: SpaceWithSomeDetails) => {
  const name = space?.content?.name
  const spaceName = isEmptyStr(name) ? <MutedSpan>{'Unnamed Space'}</MutedSpan> : name

  return spaceName
}

type SpaceNameAsLinkProps = BareProps & {
  space: SpaceWithSomeDetails
}

export const SpaceNameAsLink = React.memo(({ space, ...props }: SpaceNameAsLinkProps) => {
  const spaceName = renderSpaceName(space)

  return <ViewSpaceLink space={space.struct} title={spaceName} {...props} />
})

export const StakeButton = ({ spaceId }: { spaceId: SpaceId }) => {
  return config.creatorIds?.includes(spaceId) ? (
    <ButtonLink type='primary' href={'https://sub.id/creators'} className={clsx('mr-2')}>
      Stake
    </ButtonLink>
  ) : null
}

export const InnerViewSpace = (props: Props) => {
  const {
    spaceData: initialSpaceData,
    preview = false,
    nameOnly = false,
    withLink = false,
    miniPreview = false,
    previewWithoutBorder = false,
    withFollowButton = true,
    withStats = true,
    withTags = true,
    withStakeButton = true,
    showFullAbout = false,
    dropdownPreview = false,

    postIds = [],
    posts = [],
    imageSize = LARGE_AVATAR_SIZE,

    onClick,
  } = props
  const isMobile = useIsMobileWidthOrDevice()
  const address = useMyAddress()
  const [collapseAbout, setCollapseAbout] = useState(true)

  const spaceData = useSelectSpace(initialSpaceData?.id)
  const isMy = useIsMySpace(spaceData?.struct)
  const { spaceId } = useSelectProfileSpace(address) || {}

  const Avatar = useCallback(() => {
    if (!spaceData) return null
    const space = spaceData.struct
    const name = spaceData.content?.name
    return (
      <SpaceAvatar
        space={space}
        avatar={spaceData.content?.image}
        size={imageSize}
        isUnnamedSpace={isEmptyStr(name)}
      />
    )
  }, [spaceData, imageSize])

  // We do not return 404 page here, because this component could be used to render a space in list.
  if (!spaceData) return null

  const { struct: space, content = {} as SpaceContent } = spaceData
  const { about, tags, email, links } = content
  const contactInfo = { email, links }
  const spaceName = renderSpaceName(spaceData)

  const primaryClass = `ProfileDetails ${isMy && 'MySpace'} d-flex`

  const renderNameOnly = () =>
    withLink ? <SpaceNameAsLink space={spaceData} /> : <span>{spaceName}</span>

  const renderDropDownPreview = () => (
    <div className={`${primaryClass} DfPreview`}>
      <Avatar />
      <div className='content'>
        <div className='handle'>{spaceName}</div>
      </div>
    </div>
  )

  const renderMiniPreview = () => (
    <div className={'viewspace-minipreview'}>
      <div onClick={onClick} className={primaryClass}>
        <Avatar />
        <div className='content'>
          <div className='handle'>
            {spaceName}
            <OfficialSpaceStatus space={space} />
          </div>
        </div>
      </div>
      {withFollowButton && <FollowSpaceButton space={space} />}
    </div>
  )

  const title = React.createElement(
    preview ? 'span' : 'h1',
    { className: 'header' },
    <span className='d-flex align-items-center'>
      <ViewSpaceLink
        space={space}
        title={
          <>
            <span className='DfUnboundedTitle'>{spaceName}</span>
            <OfficialSpaceStatus space={space} />
            <MyEntityLabel isMy={isMy} className='ml-2'>
              {spaceId === initialSpaceData?.id ? 'My profile' : 'My space'}
            </MyEntityLabel>
          </>
        }
        className='d-flex align-items-center'
        {...props}
      />
    </span>,
  )

  const onToggleShow = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCollapseAbout(prev => !prev)
  }
  const renderPreview = () => (
    <div className={primaryClass}>
      <div className='DfSpaceBody'>
        <Avatar />
        <div className='ml-2 w-100'>
          <div className='d-flex justify-content-between align-items-center'>
            {title}
            <span className='d-flex align-items-center'>
              <SpaceDropdownMenu
                spaceOwnerId={space.ownerId}
                className='mx-2'
                spaceData={spaceData}
              />
              {!isMobile &&
                (isMy ? (
                  <ButtonLink
                    href={'/[spaceId]/edit'}
                    as={editSpaceUrl(space)}
                    className='mr-2 bg-transparent'
                  >
                    <EditOutlined /> Edit
                  </ButtonLink>
                ) : (
                  withStakeButton && <StakeButton spaceId={space.id} />
                ))}

              {withFollowButton && <FollowSpaceButton space={space} />}
            </span>
          </div>

          {nonEmptyStr(about) && (
            <div className='description mt-3 d-block'>
              {showFullAbout || !collapseAbout ? (
                <>
                  <DfMd source={content.about} />
                  {!showFullAbout && (
                    <div
                      className='DfBlackLink font-weight-semibold mt-1 FontNormal'
                      onClick={onToggleShow}
                    >
                      Show Less
                    </div>
                  )}
                </>
              ) : (
                <ViewSpaceLink
                  space={space}
                  className='description mt-3 d-block'
                  title={
                    <SummarizeMd
                      content={content}
                      more={
                        <span className='DfBlackLink font-weight-semibold' onClick={onToggleShow}>
                          Show More
                        </span>
                      }
                    />
                  }
                />
              )}
            </div>
          )}

          {withTags && <ViewTags tags={tags} className='mt-2' />}

          {withStats && (
            <span className='d-flex justify-content-between flex-wrap mt-3'>
              <SpaceStatsRow space={space} />
              {!preview && <ContactInfo {...contactInfo} />}
            </span>
          )}
        </div>
      </div>
    </div>
  )

  log.debug('Render a space w/ id:', space.id)

  if (nameOnly) {
    return renderNameOnly()
  } else if (dropdownPreview) {
    return renderDropDownPreview()
  } else if (miniPreview) {
    return renderMiniPreview()
  } else if (previewWithoutBorder) {
    return renderPreview()
  } else if (preview) {
    return (
      <Segment className='DfSpacePreview'>
        <EntityStatusGroup>
          {/*<PendingSpaceOwnershipPanel space={space} preview /> TODO: bad for lists! maybe revert when we will remove subscription */}
          <HiddenSpaceAlert space={space} preview />
        </EntityStatusGroup>
        {renderPreview()}
      </Segment>
    )
  }

  return (
    <Section className='mt-3'>
      <PendingSpaceOwnershipPanel space={space} />
      <HiddenSpaceAlert space={space} />
      <Section className='pt-2'>{renderPreview()}</Section>
      <Section className='mt-4'>
        <StakeSubBanner />
      </Section>
      <Section className='DfContentPage mt-4'>
        <PostPreviewsOnSpace spaceData={spaceData} posts={posts} postIds={postIds} />
      </Section>
      <MakeAsProfileModal isMySpace={isMy} />
    </Section>
  )
}

export const ViewSpace = (props: Props) => {
  const { spaceData: initialSpaceData } = props

  if (useIsUnlistedSpace(initialSpaceData)) {
    return null
  }

  return <InnerViewSpace {...props} />
}

type ViewSpaceByIdProps = ViewSpaceOptsProps & {
  spaceId: SpaceId
}

export const ViewSpaceById = React.memo(({ spaceId, ...props }: ViewSpaceByIdProps) => {
  const space = useSelectSpace(spaceId)

  if (!space) return null

  return <ViewSpace spaceData={space} {...props} />
})
