import { EditOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { PostWithSomeDetails } from 'src/types'
import { redirectToLogin } from 'src/utils/url'
import { useAuth } from '../../auth/AuthContext'
import { IconWithLabel } from '../../utils'
import { SharePostModal } from './ShareModal'

type Props = {
  postDetails: PostWithSomeDetails
  title?: React.ReactNode
  preview?: boolean
}

const EditIcon = <EditOutlined />

export const SharePostLink = ({
  postDetails: {
    post: {
      struct: { id, isSharedPost },
    },
    ext,
  },
}: Props) => {
  const {
    state: {
      completedSteps: { isSignedIn },
    },
  } = useAuth()
  const [open, setOpen] = useState<boolean>()
  const postId = isSharedPost ? ext && ext.post.struct.id : id
  const title = 'Write a post'

  return (
    <>
      <a
        className='DfBlackLink'
        onClick={() => (isSignedIn ? setOpen(true) : redirectToLogin())}
        title={title}
      >
        <IconWithLabel icon={EditIcon} label={title} />
      </a>
      {postId && <SharePostModal postId={postId} open={open} onClose={() => setOpen(false)} />}
    </>
  )
}

export default SharePostLink
