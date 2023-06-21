// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { PostUpdate } from '@subsocial/api/substrate/wrappers'
import BN from 'bn.js'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import { useCreateReloadPost } from 'src/rtk/app/hooks'
import { useCreateUpsertReply } from 'src/rtk/features/replies/repliesHooks'
import { CommentContent, IpfsCid, PostContent, PostStruct } from 'src/types'
import { getTxParams } from '../substrate'
import { CommentTxButtonType } from './utils'

const CommentEditor = dynamic(() => import('./CommentEditor'), { ssr: false })
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })

type FCallback = (id?: BN) => void

type EditCommentProps = {
  struct: PostStruct
  content: CommentContent
  callback?: FCallback
}

export const EditComment: FC<EditCommentProps> = ({ struct, content, callback }) => {
  const upsertReply = useCreateUpsertReply()
  const reloadPost = useCreateReloadPost()
  const id = struct.id

  const newTxParams = (hash: IpfsCid) => {
    const update = PostUpdate({
      // TODO setting a new space_id will move the post to another space.
      content: hash.toString(),
    })
    return [id, update]
  }

  const upsertPostContent = (content: PostContent) =>
    upsertReply({
      replyData: {
        id,
        struct,
        content,
      },
    })

  const buildTxButton = ({
    disabled,
    json,
    ipfs,
    setIpfsCid,
    onClick,
    onFailed,
    onSuccess,
  }: CommentTxButtonType) => (
    <TxButton
      type='primary'
      label='Update'
      disabled={disabled}
      params={() =>
        getTxParams({
          json: json,
          buildTxParamsCallback: newTxParams,
          ipfs,
          setIpfsCid,
        })
      }
      tx='posts.updatePost'
      onFailed={txResult => {
        upsertPostContent(content as PostContent)
        onFailed && onFailed(txResult)
      }}
      onClick={() => {
        upsertPostContent(json as PostContent)
        onClick && onClick()
      }}
      onSuccess={txResult => {
        reloadPost({ id })
        onSuccess && onSuccess(txResult)
      }}
    />
  )

  return (
    <CommentEditor
      callback={callback}
      content={content}
      CommentTxButton={buildTxButton}
      withCancel
    />
  )
}
