import { useMemo } from 'react'
import { useActions } from 'src/rtk/app/helpers'
import { useAppSelector } from 'src/rtk/app/store'
import { PostData, PostId, PostStruct } from 'src/types'
import { upsertContent } from '../contents/contentsSlice'
import { useCreateReloadPosts } from '../posts/postsHooks'
import { removePost, upsertPost } from '../posts/postsSlice'
import { selectLowValueIds } from './lowValueIdsSlice'
import { ReplyIdsByPostId, selectReplyIdsEntities, upsertReplyIdsByPostId } from './repliesSlice'

type RemoveReplyParams = {
  parentId: PostId
  replyId: PostId
}

export const useRemoveReply = () => {
  const replyIdsByParentId = useAppSelector(state => selectReplyIdsEntities(state))

  return useActions<RemoveReplyParams>(({ dispatch, args: { replyId: idToRemove, parentId } }) => {
    const oldReplyIds = replyIdsByParentId[parentId]?.replyIds || []
    dispatch(removePost(idToRemove))
    dispatch(
      upsertReplyIdsByPostId({
        replyIds: oldReplyIds.filter(replyId => replyId !== idToRemove),
        id: parentId,
      }),
    )
  })
}

type UpsertRepliesParams = {
  replyIds: ReplyIdsByPostId
  rootPostId?: PostId
  reload?: boolean
}

export const useUpsertReplies = () => {
  const replyIdsByParentId = useAppSelector(state => selectReplyIdsEntities(state))
  const reloadPosts = useCreateReloadPosts()

  return useActions<UpsertRepliesParams>(
    async ({
      dispatch,
      args: {
        replyIds: { replyIds: newIds, id },
        rootPostId,
        reload,
      },
    }) => {
      const oldReplyIds = replyIdsByParentId[id]?.replyIds || []
      const replyIds = Array.from(new Set(oldReplyIds.concat(newIds)))

      reload && (await reloadPosts({ ids: rootPostId ? [...newIds, rootPostId] : newIds }))
      dispatch(upsertReplyIdsByPostId({ replyIds, id }))
    },
  )
}

type CommonReplyArgs = {
  parentId: PostId
  reply: PostStruct
}

const buildUpsertOneArgs = ({ parentId, reply }: CommonReplyArgs) => ({
  replies: [reply],
  replyIds: {
    id: parentId,
    replyIds: [reply.id],
  },
})

type ChangeRepliesArgs = CommonReplyArgs & {
  idToRemove: PostId
  rootPostId: PostId
}

export const useCreateChangeReplies = () => {
  const upsertReplies = useUpsertReplies()
  const removeReply = useRemoveReply()

  return ({ idToRemove, ...args }: ChangeRepliesArgs) => {
    const { parentId, rootPostId } = args

    if (!parentId) return

    removeReply({ replyId: idToRemove, parentId })
    upsertReplies({ ...buildUpsertOneArgs(args), rootPostId, reload: true })
  }
}

const useCreateUpsertPost = () =>
  useActions<PostData>(({ dispatch, args: { struct, content } }) => {
    dispatch(upsertPost(struct))
    content && dispatch(upsertContent({ id: struct.contentId!, ...content }))
  })

type UpsertReplyWithContentArgs = {
  replyData: PostData
  parentId?: PostId
}

export const useCreateUpsertReply = () => {
  const upsertReplies = useUpsertReplies()
  const upsertReply = useCreateUpsertPost()

  return ({ parentId, replyData, ...args }: UpsertReplyWithContentArgs) => {
    parentId && upsertReplies(buildUpsertOneArgs({ ...args, reply: replyData.struct, parentId }))
    upsertReply(replyData)
  }
}

export function useFilterOutLowValuePosts(rootPostId: string, postIds: string[]) {
  const lowValueState = useAppSelector(state => selectLowValueIds(state, rootPostId))
  return useMemo(() => {
    const lowValueSet = new Set(lowValueState?.lowValueIds ?? [])
    return postIds.filter(postId => {
      return !lowValueSet.has(postId)
    })
  }, [postIds, lowValueState])
}
