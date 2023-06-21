// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { HiddenPostAlert } from 'src/components/posts/view-post'
import { HasPostId } from 'src/components/urls'
import { DfMd } from 'src/components/utils/DfMd'
import { CommentData } from 'src/types'
import styles from './index.module.sass'

type CommentBodyProps = {
  comment: CommentData
}

export const CommentBody = ({ comment: { struct, content } }: CommentBodyProps) => {
  return (
    <div className={styles.BumbleContent}>
      <HiddenPostAlert post={struct} className={styles.DfCommentAlert} preview />
      <DfMd source={content?.body} />
    </div>
  )
}

const FAKE = 'fake'

export const isFakeId = (comment: HasPostId) => comment.id.toString().startsWith(FAKE)
