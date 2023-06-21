// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { EditOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { PostWithSomeDetails } from 'src/types'
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
    openSignInModal,
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
        onClick={() => (isSignedIn ? setOpen(true) : openSignInModal())}
        title={title}
      >
        <IconWithLabel icon={EditIcon} label={title} />
      </a>
      {postId && <SharePostModal postId={postId} open={open} onClose={() => setOpen(false)} />}
    </>
  )
}

export default SharePostLink
