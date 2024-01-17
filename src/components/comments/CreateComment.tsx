import { Comment, IpfsContent } from '@subsocial/api/substrate/wrappers'
import BN from 'bn.js'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { useCreateUpsertPost } from 'src/rtk/app/hooks'
import {
  useCreateChangeReplies,
  useCreateUpsertReply,
  useRemoveReply,
} from 'src/rtk/features/replies/repliesHooks'
import { asCommentStruct, convertToDerivedContent, IpfsCid, PostData, PostStruct } from 'src/types'
import { useMyAddress } from '../auth/MyAccountsContext'
import { HiddenPostAlert } from '../posts/view-post'
import { getNewIdFromEvent, getTxParams } from '../substrate'
import { CommentEventProps } from './CommentEditor'
import { buildMockComment, CommentTxButtonType } from './utils'

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false })
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type NewCommentProps = {
  post: PostStruct
  callback?: (id?: BN) => void
  withCancel?: boolean
  asStub?: boolean
  className?: string
  autoFocus?: boolean
  eventProps: CommentEventProps
}

export const NewComment: FC<NewCommentProps> = ({
  post,
  callback,
  withCancel,
  asStub,
  className,
  autoFocus,
  eventProps,
}) => {
  const { id: parentId, isComment } = post
  const { subsocial } = useSubsocialApi()
  const address = useMyAddress()
  const changeReply = useCreateChangeReplies()
  const removeReply = useRemoveReply()
  const upsertReply = useCreateUpsertReply()
  const upsertPost = useCreateUpsertPost()

  if (post.hidden) {
    const msg = 'You cannot comment on this post because it is unlisted'
    return <HiddenPostAlert post={post} desc={msg} className='mt-3' />
  }

  let rootPostId = parentId
  let commentExt: any

  if (isComment) {
    const comment = asCommentStruct(post)
    rootPostId = comment.rootPostId

    commentExt = Comment({
      parentId,
      rootPostId,
    })
  } else {
    commentExt = Comment({
      rootPostId,
    })
  }

  const newExtension = { Comment: commentExt }

  const newTxParams = (cid: IpfsCid) => [null, newExtension, IpfsContent(cid)]

  const replaceTempReplyWithOnChainVersion = (onChainId: BN, fakeId: string) =>
    subsocial.findPostWithSomeDetails({ id: onChainId }).then(reply => {
      reply &&
        changeReply({
          reply: reply.post.struct,
          rootPostId,
          parentId,
          idToRemove: fakeId,
        })
    })

  const putTempReplyInReduxStore = (replyBody: string, fakeId: string) => {
    if (!address) return

    const replyData = {
      struct: buildMockComment({ fakeId, address }),
      content: convertToDerivedContent({ body: replyBody }),
    } as PostData

    // Put a temp reply in Redux store:
    upsertReply({ replyData, parentId })

    // Increment a number of replies on a parent post:
    if (post.repliesCount) {
      upsertPost({ ...post, repliesCount: post.repliesCount + 1 })
    }
  }

  const removeTempReplyFromReduxStore = (fakeId: string) => {
    // Put a temp reply in Redux store:
    removeReply({ replyId: fakeId, parentId })

    // Reset a parent post to its initial state:
    upsertPost(post)
  }

  const buildTxButton = ({
    disabled,
    json,
    fakeId,
    ipfs,
    setIpfsCid,
    onClick,
    onFailed,
    onSuccess,
    loading,
  }: CommentTxButtonType) => (
    <TxButton
      type='primary'
      label='Comment'
      disabled={disabled}
      loading={loading}
      params={() =>
        getTxParams({
          json: json,
          buildTxParamsCallback: newTxParams,
          ipfs,
          setIpfsCid,
        })
      }
      tx='posts.createPost'
      onFailed={txResult => {
        fakeId && removeTempReplyFromReduxStore(fakeId)
        onFailed && onFailed(txResult)
      }}
      onSuccess={txResult => {
        const onChainId = getNewIdFromEvent(txResult)
        onChainId && fakeId && replaceTempReplyWithOnChainVersion(onChainId, fakeId)
        onSuccess && onSuccess(txResult)
      }}
      onClick={() => {
        fakeId && putTempReplyInReduxStore(json.body, fakeId)
        onClick && onClick()
      }}
    />
  )

  return (
    <CommentEditor
      eventProps={eventProps}
      autoFocus={autoFocus}
      callback={callback}
      CommentTxButton={buildTxButton}
      withCancel={withCancel}
      asStub={asStub}
      className={className}
    />
  )
}
