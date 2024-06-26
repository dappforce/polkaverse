import clsx from 'clsx'
import { useDispatch } from 'react-redux'
import { TxDiv } from 'src/components/substrate/TxDiv'
import TxButton from 'src/components/utils/TxButton'
import { removePost } from 'src/rtk/features/posts/postsSlice'
import { PostStruct } from 'src/types'
import styles from './view-post/helpers.module.sass'

type DeletePostProps = {
  post: PostStruct
  asLink?: boolean
  label?: string
}

export function DeletePostButton(props: DeletePostProps) {
  const { post, asLink, label } = props
  const dispatch = useDispatch()
  const { isComment } = post
  const postType = isComment ? 'comment' : 'post'

  const newTxParams = () => {
    return [post.id, null]
  }

  const onTxSuccess = () => {
    dispatch(removePost(post.id))
  }
  const TxAction = asLink ? TxDiv : TxButton

  return (
    <TxAction
      className={asLink ? clsx('m-0', styles.DeleteButton) : ''}
      label={label || (postType === 'comment' ? 'Delete comment' : 'Delete post')}
      size='small'
      params={newTxParams}
      tx={'posts.movePost'}
      onSuccess={onTxSuccess}
      failedMessage={`Failed to move your ${postType} to null space`}
    />
  )
}

export default DeletePostButton
