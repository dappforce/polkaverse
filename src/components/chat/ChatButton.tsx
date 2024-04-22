import { useFetchPosts, useSelectPost, useSelectSpace } from 'src/rtk/app/hooks'
import { getCreatorChatIdFromProfile } from '../utils'
import CreateChatModalButton from './CreateChatModal'
import UnhideChatButton from './UnhideChatButton'

type ChatButtonProps = {
  spaceId: string
}

const ChatButton = ({ spaceId }: ChatButtonProps) => {
  const space = useSelectSpace(spaceId)

  const spaceContent = space?.content

  const chatId = getCreatorChatIdFromProfile(space)

  useFetchPosts(chatId ? [chatId] : [])

  const chat = useSelectPost(chatId)

  const isPostHidden = !!chat?.post.struct.hidden
  const isRemovedPost = !chat?.post.struct.spaceId

  if (chatId && chat && spaceContent && !isPostHidden) return null

  return isPostHidden && !isRemovedPost ? (
    <UnhideChatButton post={chat?.post?.struct} />
  ) : (
    <CreateChatModalButton spaceId={spaceId} />
  )
}

export default ChatButton
