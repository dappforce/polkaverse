// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { isEmptyArray, nonEmptyArr } from '@subsocial/utils'
import { Modal } from 'antd'
import Button from 'antd/lib/button'
import { LabeledValue } from 'antd/lib/select'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import modalStyles from 'src/components/posts/modals/index.module.sass'
import { CreateSpaceButton } from 'src/components/spaces/helpers'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { postUrl } from 'src/components/urls/subsocial'
import NoData from 'src/components/utils/EmptyList'
import { MyAccountProps } from 'src/components/utils/MyAccount'
import SelectSpacePreview from 'src/components/utils/SelectSpacePreview'
import { useAppSelector } from 'src/rtk/app/store'
import { selectSpaceIdsByOwner } from 'src/rtk/features/spaceIds/ownSpaceIdsSlice'
import { PostData, SpaceId } from 'src/types'
import { PublicPostPreviewById } from '../PublicPostPreview'

const TxButton = dynamic(() => import('src/components/utils/TxButton'), { ssr: false })

type ModalProps = MyAccountProps & {
  post: PostData
  open: boolean
  onClose: () => void
}

type InnerModalProps = ModalProps & {
  spaceIds: SpaceId[]
}

const InnerMoveModal = (props: InnerModalProps) => {
  const { open, onClose, post, spaceIds } = props

  const router = useRouter()

  const [spaceId, setSpaceId] = useState(spaceIds[0])
  const postId = post.struct.id

  const onTxFailed: TxFailedCallback = () => {
    onClose()
  }

  const onTxSuccess: TxCallback = () => {
    router.push('/[spaceId]/[slug]', postUrl({ id: spaceId }, post))
    onClose()
  }

  const newTxParams = () => {
    return [postId, spaceId]
  }

  const renderTxButton = () =>
    nonEmptyArr(spaceIds) ? (
      <TxButton
        type='primary'
        label={'Move'}
        params={newTxParams}
        tx={'posts.movePost'}
        onFailed={onTxFailed}
        onSuccess={onTxSuccess}
        successMessage='Moved post to another space'
        failedMessage='Failed to move post'
      />
    ) : (
      <CreateSpaceButton>Create one more space</CreateSpaceButton>
    )

  const renderMovePostView = () => {
    if (isEmptyArray(spaceIds)) {
      return <NoData description='You need to have at least one more space to move post' />
    }

    return (
      <div className={modalStyles.DfPostActionModalBody}>
        <span className={modalStyles.DfPostActionModalSelector}>
          <SelectSpacePreview
            spaceIds={spaceIds || []}
            onSelect={saveSpace}
            imageSize={24}
            defaultValue={spaceId?.toString()}
          />
        </span>

        <div style={{ margin: '0.75rem 0' }}>
          <PublicPostPreviewById postId={postId} /* asRegularPost */ />
        </div>
      </div>
    )
  }

  const saveSpace = (value?: string | number | LabeledValue) => {
    setSpaceId((value as LabeledValue).value.toString())
  }

  return (
    <Modal
      onCancel={onClose}
      visible={open}
      title={'Move post to another space'}
      className={modalStyles.DfPostActionModal}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          {renderTxButton()}
        </>
      }
    >
      {renderMovePostView()}
    </Modal>
  )
}

export const MoveModal = (props: ModalProps) => {
  const myAddress = useMyAddress()
  const spaceIds = useAppSelector(state => selectSpaceIdsByOwner(state, myAddress as string)) || []

  if (!spaceIds) {
    return null
  }

  return <InnerMoveModal spaceIds={spaceIds} {...props} />
}
