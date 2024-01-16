import clsx from 'clsx'
import { HiddenPostAlert } from 'src/components/posts/view-post'
import { HasPostId } from 'src/components/urls'
import { DfMd } from 'src/components/utils/DfMd'
import { CommentData } from 'src/types'
import styles from './index.module.sass'

type CommentBodyProps = {
  comment: CommentData
  className?: string
}

export const CommentBody = ({ comment: { struct, content }, className }: CommentBodyProps) => {
  return (
    <div className={clsx(styles.BumbleContent, className)}>
      <HiddenPostAlert post={struct} className={styles.DfCommentAlert} preview />
      <DfMd source={content?.body} />
    </div>
  )
}

const FAKE = 'fake'

export const isFakeId = (comment: HasPostId) => comment.id.toString().startsWith(FAKE)
