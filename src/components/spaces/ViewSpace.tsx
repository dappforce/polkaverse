import { EditOutlined } from '@ant-design/icons'
import { isEmptyStr, newLogger, nonEmptyStr } from '@subsocial/utils'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import React, { MouseEvent, useCallback, useMemo, useState } from 'react'
import { ButtonLink } from 'src/components/utils/CustomLinks'
import { Segment } from 'src/components/utils/Segment'
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config'
import { useHasUserASpacePermission } from 'src/permissions/checkPermission'
import { useSendEvent } from 'src/providers/AnalyticContext'
// import { useSetChatEntityConfig, useSetChatOpen } from 'src/rtk/app/hooks'
import { useIsCreatorSpace } from 'src/rtk/features/creators/creatorsListHooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { SpaceContent, SpaceId, SpaceStruct, SpaceWithSomeDetails } from 'src/types'
import { getAmountRange } from 'src/utils/analytics'
import { useSelectProfileSpace } from '../../rtk/features/profiles/profilesHooks'
import { useSelectSpace } from '../../rtk/features/spaces/spacesHooks'
import { AccountActivity } from '../activity/AccountActivity'
import { useMyAddress } from '../auth/MyAccountsContext'
import ChatButton from '../chat/ChatButton'
import MobileActiveStakingSection from '../creators/MobileActiveStakingSection'
import WriteSomething from '../posts/WriteSomething'
import MakeAsProfileModal from '../profiles/address-views/utils/MakeAsProfileModal'
import { useIsMobileWidthOrDevice } from '../responsive'
import { editSpaceUrl, spaceUrl } from '../urls'
import { isHidden } from '../utils'
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
import SpacePermissionInfoSection from './permissions/SpacePermissionInfoSection'
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

export const StakeButton = ({ spaceStruct }: { spaceStruct: SpaceStruct }) => {
  const { isCreatorSpace } = useIsCreatorSpace(spaceStruct.id)
  return isCreatorSpace ? (
    <ButtonLink
      type='primary'
      target='_blank'
      href={`https://sub.id/creators/${spaceUrl(spaceStruct)}`}
      className={clsx('mr-2')}
    >
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
    showFullAbout = false,
    dropdownPreview = false,

    postIds = [],
    posts = [],
    imageSize = LARGE_AVATAR_SIZE,
    postsCount,

    onClick,
  } = props
  const isMobile = useIsMobileWidthOrDevice()
  const address = useMyAddress()
  const [collapseAbout, setCollapseAbout] = useState(true)
  const sendEvent = useSendEvent()
  const { data: totalStake } = useFetchTotalStake(address ?? '')

  const spaceData = useSelectSpace(initialSpaceData?.id)
  const isMy = useIsMySpace(spaceData?.struct)
  const { spaceId } = useSelectProfileSpace(address) || {}
  const canCreatePost = useHasUserASpacePermission({
    space: spaceData?.struct,
    permission: 'CreatePosts',
  })
  const canCreatePostAndIsNotHidden = address && canCreatePost && !isHidden(spaceData?.struct)

  const { spaceId: ownerProfileSpaceId } = useSelectProfileSpace(spaceData?.struct.ownerId) || {}
  const isProfileSpace = ownerProfileSpaceId === spaceData?.id

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

  const isMySpace = useIsMySpace(spaceData?.struct)
  const { filteredPostIds, filteredPosts, filteredPostsCount } = useMemo(() => {
    const postsWithSpace = posts?.filter(post => !!post.post.struct.spaceId)
    const postsWithSpaceIds = postsWithSpace?.map(post => post.post.id)

    if (isMySpace)
      return {
        filteredPosts: postsWithSpace,
        filteredPostIds: postsWithSpaceIds,
        filteredPostsCount: postsCount,
      }

    const hiddenPosts = new Set()

    const filteredPosts = postsWithSpace.filter(post => {
      if (isHidden(post.post.struct)) {
        hiddenPosts.add(post.post.id)
        return false
      }
      return true
    })

    const filteredPostIds = postsWithSpaceIds.filter(id => !hiddenPosts.has(id))
    const filteredPostsCount = postsCount ? postsCount - filteredPostIds.length : 0

    return {
      filteredPosts,
      filteredPostIds,
      filteredPostsCount: filteredPostsCount > 0 ? filteredPostsCount : 0,
    }
  }, [posts, postIds, isMySpace])

  // We do not return 404 page here, because this component could be used to render a space in list.
  if (!spaceData) return null

  const { struct: space, content = {} as SpaceContent } = spaceData
  const { about, tags, email, links } = content
  const contactInfo = { email, links }
  const spaceName = renderSpaceName(spaceData)

  const chatButton = <ChatButton spaceId={spaceId} />

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
    <span className='text-wrap-balance'>
      <ViewSpaceLink
        space={space}
        title={
          <>
            <span className='DfUnboundedTitle'>{spaceName}</span>
            <OfficialSpaceStatus space={space} className='!d-inline' />
            <MyEntityLabel isMy={isMy} className='ml-2'>
              {spaceId === initialSpaceData?.id ? 'My profile' : 'My space'}
            </MyEntityLabel>
          </>
        }
        {...props}
      />
    </span>,
  )

  const onToggleShow = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCollapseAbout(prev => !prev)
  }

  const previewButtons = (size: 'small' | 'middle' = 'middle') => (
    <div className='d-flex align-items-center GapTiny'>
      {!isMobile && isMy && (
        <ButtonLink
          size={size}
          href={'/[spaceId]/edit'}
          as={editSpaceUrl(space)}
          className='bg-transparent'
        >
          <EditOutlined /> Edit
        </ButtonLink>
      )}

      {withFollowButton && (
        <>
          {isProfileSpace && isMySpace ? (
            chatButton
          ) : (
            <div
              onClick={() =>
                sendEvent('follow', {
                  spaceId: space.id,
                  eventSource: 'space',
                  amountRange: getAmountRange(totalStake?.amount),
                })
              }
            >
              <FollowSpaceButton size={size} ghost={false} space={space} />
            </div>
          )}
        </>
      )}
    </div>
  )
  const spaceAbout = (
    <div>
      {nonEmptyStr(about) && (
        <div className='description mt-2 d-block FontSmall'>
          {showFullAbout || !collapseAbout ? (
            <>
              <DfMd source={content.about} className='FontSmall' />
              {!showFullAbout && (
                <div className='DfBlackLink font-weight-semibold mt-1' onClick={onToggleShow}>
                  Show Less
                </div>
              )}
            </>
          ) : (
            <ViewSpaceLink
              space={space}
              className='description mt-2 d-block'
              title={
                <SummarizeMd
                  content={content}
                  className='FontSmall'
                  more={
                    <span
                      className='DfBlackLink font-weight-semibold FontSmall'
                      onClick={onToggleShow}
                    >
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
  )
  const renderPreview = () => (
    <div className={primaryClass}>
      <div className='d-flex flex-column w-100'>
        <div className={clsx('DfSpaceBody w-100')}>
          <Avatar />
          <div className={clsx('ml-2 w-100', isMobile && 'mt-1')}>
            <div className='d-flex flex-column GapTiny'>
              <div className={clsx('d-flex justify-content-between align-items-center')}>
                {title}
                <span className='d-flex align-items-center GapTiny ml-2'>
                  <SpaceDropdownMenu spaceOwnerId={space.ownerId} spaceData={spaceData} />
                  {!isMobile && previewButtons('middle')}
                </span>
              </div>
              {isMobile && previewButtons('middle')}
            </div>
            {!isMobile && spaceAbout}
          </div>
        </div>
        {isMobile && <div className='mt-1'>{spaceAbout}</div>}
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
      <MobileActiveStakingSection offsetY={-28} showTopUsers={false} />
      <PendingSpaceOwnershipPanel space={space} />
      <HiddenSpaceAlert space={space} />
      <Section className='pt-2'>{renderPreview()}</Section>

      {isMySpace && <SpacePermissionInfoSection spaceId={space.id} />}

      {canCreatePostAndIsNotHidden && (
        <WriteSomething className='mt-3' defaultSpaceId={spaceData.id} />
      )}
      <Section className='DfContentPage mt-4'>
        {isProfileSpace ? (
          <AccountActivity
            withSpacePosts={{
              spaceData,
              posts: filteredPosts,
              postIds: filteredPostIds,
            }}
            withWriteSomethingBlock={false}
            address={spaceData.struct.ownerId}
            spaceId={ownerProfileSpaceId}
            postsCount={filteredPostsCount}
          />
        ) : (
          <PostPreviewsOnSpace
            key={spaceData.id}
            spaceData={spaceData}
            posts={posts}
            postIds={postIds}
          />
        )}
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
