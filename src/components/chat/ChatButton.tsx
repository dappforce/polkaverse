import { isEmptyArray } from '@subsocial/utils'
import { useSelectPost, useSelectSpace } from 'src/rtk/app/hooks'
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

  const post = useSelectPost(chat.id)

  const isPostHidden = !!post?.post.struct.hidden

  if (spaceContent && !isEmptyArray(chats) && !isPostHidden) return null

  return isPostHidden ? (
    <UnhideChatButton post={post?.post?.struct} />
  ) : (
    <CreateChatModalButton spaceId={spaceId} />
  )
}

export default ChatButton
