import { PostUpdate } from '@subsocial/api/substrate/wrappers'
import { PostStruct } from '@subsocial/api/types'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchPost } from 'src/rtk/features/posts/postsSlice'
import { DataSourceTypes } from 'src/types'
import { useSubsocialApi } from '../substrate'
import HiddenButton from '../utils/HiddenButton'

type UnhideChatButtonProps = {
  post?: PostStruct
}

const UnhideChatButton = ({ post }: UnhideChatButtonProps) => {
  const dispatch = useAppDispatch()
  const { subsocial } = useSubsocialApi()

  if (!post) return null

  const newTxParams = () => {
    const update = PostUpdate({
      hidden: false,
    })
    return [post.id, update]
  }

  const onTxSuccess = () => {
    dispatch(
      fetchPost({ api: subsocial, id: post.id, dataSource: DataSourceTypes.CHAIN, reload: true }),
    )
  }

  return (
    <HiddenButton
      struct={post}
      newTxParams={newTxParams}
      buttonType='primary'
      size={'middle'}
      ghost
      onTxSuccess={onTxSuccess}
      type='post'
      label='Unhide chat'
    />
  )
}

export default UnhideChatButton
