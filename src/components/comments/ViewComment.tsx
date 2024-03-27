import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import { Alert, Button, Tag, Tooltip } from 'antd'
import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'
import { TbCoins, TbMessageCircle2 } from 'react-icons/tb'
import { getNeededLock } from 'src/config/constants'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import {
  asCommentData,
  asCommentStruct,
  CommentContent,
  PostStruct,
  PostWithSomeDetails,
  SpaceStruct,
} from 'src/types'
import { getShortTimeRelativeToNow } from 'src/utils/date'
import { activeStakingLinks } from 'src/utils/links'
import { useMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import SubTeamLabel from '../moderation/SubTeamLabel'
import { ShareDropdown } from '../posts/share/ShareDropdown'
import { useShouldRenderMinStakeAlert } from '../posts/view-post'
import { PostDropDownMenu } from '../posts/view-post/PostDropDownMenu'
import PostRewardStat from '../posts/view-post/PostRewardStat'
import AuthorSpaceAvatar from '../profiles/address-views/AuthorSpaceAvatar'
import Name from '../profiles/address-views/Name'
import CustomLink from '../referral/CustomLink'
import { equalAddresses } from '../substrate'
import { postUrl } from '../urls'
import { formatDate, IconWithLabel, useIsHidden } from '../utils'
import { MutedSpan } from '../utils/MutedText'
import { Pluralize } from '../utils/Plularize'
import SuperLike from '../voting/SuperLike'
import { CommentEventProps } from './CommentEditor'
import { ViewCommentsTree } from './CommentTree'
import { NewComment } from './CreateComment'
import { CommentBody } from './helpers'
import { EditComment } from './UpdateComment'
import { useRepliesData } from './utils'

type Props = {
  space?: SpaceStruct
  rootPost?: PostStruct
  comment: PostWithSomeDetails
  withShowReplies?: boolean
  eventProps: CommentEventProps
  showAllReplies: boolean
}

export const InnerViewComment: FC<Props> = props => {
  const {
    space = { id: 0 } as any as SpaceStruct,
    rootPost,
    comment: commentDetails,
    withShowReplies = false,
    eventProps,
    showAllReplies,
  } = props

  const { post: comment } = commentDetails
  const shouldRenderAlert = useShouldRenderMinStakeAlert(comment.struct)

  const commentStruct = asCommentStruct(comment.struct)
  const commentContent = comment.content as CommentContent
  const { id, createdAtTime, ownerId } = commentStruct

  const myAddress = useMyAddress() ?? ''
  const { data: totalStake } = useFetchTotalStake(myAddress)

  const owner = useSelectProfile(ownerId)

  const [showEditForm, setShowEditForm] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

  const { hasReplies, replyCountWithFake } = useRepliesData(commentStruct)

  const [showReplies, setShowReplies] = useState(withShowReplies && hasReplies)

  useEffect(() => {
    setShowReplies(withShowReplies && hasReplies)
  }, [hasReplies])

  const isFake = id.startsWith('fake')
  const commentLink = postUrl(space, comment)
  const isRootPostOwner = equalAddresses(rootPost?.ownerId, commentStruct.ownerId)

  const ViewRepliesLink = () => {
    const viewActionMessage = showReplies ? (
      <>
        <CaretUpOutlined /> {'Hide'}
      </>
    ) : (
      <>
        <CaretDownOutlined /> {'View'}
      </>
    )

    return (
      <>
        <CustomLink href={commentLink}>
          <a
            onClick={event => {
              event.preventDefault()
              setShowReplies(!showReplies)
            }}
          >
            {viewActionMessage}{' '}
            <Pluralize count={replyCountWithFake || 0} singularText='reply' pluralText='replies' />
          </a>
        </CustomLink>
      </>
    )
  }

  const onEditComment = () => setShowEditForm(true)

  const newCommentForm = showReplyForm && (
    <NewComment
      eventProps={eventProps}
      autoFocus
      post={commentStruct}
      onCancel={() => setShowReplyForm(false)}
      onSuccess={() => setShowReplyForm(false)}
      withCancel
    />
  )

  return (
    <div className={clsx('w-100', isFake ? 'DfDisableLayout pb-3' : '')}>
      <div className={clsx('d-flex align-items-start w-100')}>
        <AuthorSpaceAvatar size={32} authorAddress={ownerId} />
        <div className='d-flex flex-column w-100'>
          <div className='d-flex align-items-center justify-content-between GapTiny'>
            <div className='d-flex align-items-baseline GapSemiTiny'>
              <div className='d-flex align-items-baseline GapSemiTiny'>
                <Name
                  className='!ColorMuted !FontWeightNormal FontSmall'
                  address={ownerId}
                  owner={owner}
                  asLink
                />
                {isRootPostOwner && (
                  <Tag color='blue' className='mr-0'>
                    <Tooltip title='Original Poster'>OP</Tooltip>
                  </Tag>
                )}
                <SubTeamLabel address={ownerId} />
              </div>
              <MutedSpan>&middot;</MutedSpan>
              <CustomLink href='/[spaceId]/[slug]' as={commentLink}>
                <a className='DfGreyLink FontTiny' title={formatDate(createdAtTime)}>
                  {getShortTimeRelativeToNow(createdAtTime)}
                </a>
              </CustomLink>
            </div>
            <div className='d-flex align-items-center GapTiny'>
              {!isFake && (
                <PostDropDownMenu
                  className='d-flex align-items-center ColorMuted'
                  style={{ position: 'relative', top: '1px' }}
                  post={comment}
                  space={space}
                  onEditComment={onEditComment}
                />
              )}
            </div>
          </div>
          <div className='mt-1'>
            {showEditForm ? (
              <EditComment
                eventProps={eventProps}
                struct={commentStruct}
                content={commentContent}
                onCancel={() => setShowEditForm(false)}
                onSuccess={() => setShowEditForm(false)}
              />
            ) : (
              <CommentBody comment={asCommentData(comment)} />
            )}
          </div>
          <div
            className='d-flex align-items-center justify-content-between mt-1.5'
            style={{ flexWrap: 'wrap', gap: '0 0.75rem' }}
          >
            <div className='d-flex align-items-center GapNormal'>
              <SuperLike
                isComment
                key={`voters-of-comments-${id}`}
                className='!py-0.5'
                iconClassName='!FontSmall'
                post={commentStruct}
              />
              <PostRewardStat postId={comment.id} />
            </div>
            <div className='d-flex align-items-center GapNormal ml-auto'>
              {shouldRenderAlert && (
                <Alert
                  style={{ border: 'none', padding: '0.125rem 0.5rem' }}
                  className='RoundedLarge'
                  type='warning'
                  message={
                    <Tooltip
                      title={
                        <span>
                          <span>
                            Lock{' '}
                            <FormatBalance
                              currency='SUB'
                              value={getNeededLock(totalStake?.amount).toString()}
                              precision={2}
                              withMutedDecimals={false}
                            />{' '}
                            more in order to earn rewards for this comment.
                          </span>
                          <CustomLink href={activeStakingLinks.learnMore}>
                            <a
                              target='_blank'
                              className='FontWeightMedium ml-1'
                              style={{ color: '#f759ab' }}
                            >
                              Learn How
                            </a>
                          </CustomLink>
                        </span>
                      }
                    >
                      <div
                        className='d-flex align-items-center GapTiny'
                        style={{ color: '#bd7d05' }}
                      >
                        <TbCoins />
                        <span>Not monetized</span>
                      </div>
                    </Tooltip>
                  }
                />
              )}
              <Button
                key={`reply-comment-${id}`}
                className='p-0 ColorMuted'
                style={{ border: 'none', boxShadow: 'none', background: 'transparent' }}
                onClick={() => setShowReplyForm(true)}
              >
                <span className='d-flex align-items-center'>
                  <IconWithLabel icon={<TbMessageCircle2 className='FontNormal' />} label='Reply' />
                </span>
              </Button>
              <ShareDropdown
                postDetails={commentDetails}
                space={space}
                className='p-0'
                iconSize='normal'
              />
            </div>
          </div>
          <div className='mt-1.5 d-flex flex-column'>
            {newCommentForm}
            {hasReplies && (
              <div className='pb-2'>
                {!withShowReplies && <ViewRepliesLink />}
                {showReplies && rootPost?.id && (
                  <ViewCommentsTree
                    rootPostId={rootPost.id}
                    showAllReplies={showAllReplies}
                    eventProps={{ ...eventProps, level: eventProps.level + 1 }}
                    parentId={commentStruct.id}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const ViewComment = (props: Props) => {
  const isHiddenComment = useIsHidden(props.comment.post)
  if (!props.comment || isHiddenComment) return null

  return <InnerViewComment {...props} />
}

export default ViewComment
