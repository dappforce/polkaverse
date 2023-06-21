// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useState } from 'react'
import { MoveModal } from 'src/components/posts/modals/MoveModal'
import { PostData } from 'src/types'

type Props = {
  post: PostData
}

export const MovePostLink = ({ post }: Props) => {
  const [open, setOpen] = useState<boolean>(false)
  const title = 'Move post'

  return (
    <>
      <a onClick={() => setOpen(true)} title={title}>
        {title}
      </a>
      <MoveModal post={post} open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default MovePostLink
