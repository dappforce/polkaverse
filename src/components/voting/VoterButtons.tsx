import { DislikeOutlined, DislikeTwoTone } from '@ant-design/icons'
import { ButtonProps } from 'antd/lib/button'
import clsx from 'clsx'
import dynamic from 'next/dynamic'
import React, { CSSProperties } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { useCreateReloadPost, useCreateUpsertPost } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { useCreateUpsertMyReaction } from 'src/rtk/features/reactions/myPostReactionsHooks'
import { selectMyReactionByPostId } from 'src/rtk/features/reactions/myPostReactionsSlice'
import {
  PostStruct,
  Reaction,
  ReactionEnum,
  ReactionId,
  ReactionStruct,
  ReactionType,
} from 'src/types'
import { useMyAddress } from '../auth/MyAccountsContext'
import { useResponsiveSize } from '../responsive'
import { getNewIdsFromEvent } from '../substrate'
import { IconWithLabel } from '../utils'
import { BareProps } from '../utils/types'
import { getPostStructWithUpdatedCounts } from './utils'

const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type VoterProps = BareProps & {
  post: PostStruct
  preview?: boolean
}

type VoterButtonProps = VoterProps &
  ButtonProps & {
    reactionEnum: ReactionEnum
    reaction?: ReactionStruct
    onSuccess?: () => void
    preview?: boolean
  }

const VoterButton = React.memo(
  ({
    reactionEnum,
    post,
    reaction: oldReaction = { id: post.id } as ReactionStruct,
    className,
    style,
    onSuccess,
    preview,
    disabled,
  }: VoterButtonProps) => {
    const { id: postId, upvotesCount, downvotesCount } = post
    const { isMobile } = useResponsiveSize()

    const upsertMyReaction = useCreateUpsertMyReaction()
    const upsertPost = useCreateUpsertPost()
    const reloadPost = useCreateReloadPost()

    const { reactionId, kind: oldKind } = oldReaction

    const newKind = reactionEnum.valueOf() as ReactionType
    const isUpvote = newKind === ReactionEnum.Upvote

    const count = isUpvote ? upvotesCount : downvotesCount
    const args = { id: postId }

    const buildTxParams = () => {
      if (!reactionId) {
        // Case: Add a new reaction
        return [postId, newKind]
      } else if (oldKind !== newKind) {
        // Case: Change a kind of the existing reaction
        return [postId, reactionId, newKind]
      } else {
        // Case: Delete the existing reaction
        return [postId, reactionId]
      }
    }

    const isActive = oldKind === newKind
    const color = isUpvote ? '#eb2f96' : '#ff0000'

    const changeReactionTx = isActive
      ? 'reactions.deletePostReaction'
      : 'reactions.updatePostReaction'

    const updateOrDeleteReaction = (_newReactionId?: ReactionId) => {
      let newReactionId = _newReactionId || reactionId

      if (!newReactionId && !isActive) {
        newReactionId = `fakeId-${postId}`
      }

      const newReaction: Reaction = {
        reactionId: newReactionId,
        kind: isActive ? undefined : newKind,
      }

      upsertMyReaction({ id: postId, ...newReaction })
    }

    let icon: JSX.Element
    const labelText = isUpvote ? 'Like' : 'Dislike'
    const label = preview || isMobile ? undefined : labelText
    if (isUpvote) {
      // offsets is based on icon, use em to recalculate based on icon's font-size.
      const upvoteButtonStyle: CSSProperties = { position: 'relative', top: '0.07em' }
      icon = isActive ? (
        <AiFillHeart className='FontSemilarge ColorPrimary' style={upvoteButtonStyle} />
      ) : (
        <AiOutlineHeart className='FontSemilarge' style={upvoteButtonStyle} />
      )
    } else {
      const downvoteButtonStyle: CSSProperties = { position: 'relative', top: '0.21em' }
      icon = isActive ? (
        <DislikeTwoTone style={label && downvoteButtonStyle} twoToneColor={color} />
      ) : (
        <DislikeOutlined style={label && downvoteButtonStyle} />
      )
    }

    return (
      <TxButton
        className={clsx('DfVoterButton ColorMuted', className)}
        style={{
          color: isActive ? color : '',
          ...style,
        }}
        tx={!reactionId ? 'reactions.createPostReaction' : changeReactionTx}
        params={buildTxParams()}
        onClick={() => {
          updateOrDeleteReaction()
          upsertPost(getPostStructWithUpdatedCounts({ post, oldReaction, newKind }))
        }}
        onSuccess={txResult => {
          reloadPost(args)

          const newReactionId = reactionId || getNewIdsFromEvent(txResult)[1]?.toString()
          updateOrDeleteReaction(newReactionId)
          onSuccess && onSuccess()
        }}
        onFailed={() => {
          upsertMyReaction(oldReaction)
          upsertPost(post)
        }}
        title={preview ? label : undefined}
        disabled={disabled}
        withSpinner={false}
      >
        <IconWithLabel icon={icon} count={count} label={label} />
      </TxButton>
    )
  },
)

type InnerVoterButtonsProps = VoterProps & {
  reaction?: ReactionStruct
}

const InnerVoterButtons = (props: InnerVoterButtonsProps) => {
  return (
    <>
      <VoterButton reactionEnum={ReactionEnum.Upvote} {...props} />
      {/* <VoterButton reactionEnum={ReactionEnum.Downvote} {...props} /> */}
    </>
  )
}

export const VoterButtons = (props: VoterProps) => {
  const myAddress = useMyAddress()
  const reaction = useAppSelector(state =>
    selectMyReactionByPostId(state, { postId: props.post.id, myAddress }),
  )

  return <InnerVoterButtons reaction={reaction} {...props} />
}
