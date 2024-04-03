import { isEmptyArray } from '@subsocial/utils'
import { useFetchPosts, useSelectPost, useSelectSpace } from 'src/rtk/app/hooks'
import CreateChatModalButton from './CreateChatModal'
import UnhideChatButton from './UnhideChatButton'

type ChatButtonProps = {
  spaceId?: string
}

const ChatButton = ({ spaceId }: ChatButtonProps) => {
  const space = useSelectSpace(spaceId)

  const spaceContent = space?.content

  const chats = spaceContent?.chats
  const chat = chats?.[0]

  useFetchPosts(chat ? [chat?.id] : [])

  const post = useSelectPost(chat?.id)

  const isPostHidden = !!post?.post.struct.hidden
  const isRemovedPost = !post?.post.struct.spaceId

  if (chat && post && spaceContent && !isEmptyArray(chats) && !isPostHidden) return null

  return isPostHidden && !isRemovedPost ? (
    <UnhideChatButton post={post?.post?.struct} />
  ) : (
    <CreateChatModalButton spaceId={spaceId} />
  )
}

export default ChatButton
