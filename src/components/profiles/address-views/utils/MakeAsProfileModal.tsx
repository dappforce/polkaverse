// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Button, Modal } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import store from 'store'
import { useFetchSpaces } from '../../../../rtk/features/spaces/spacesHooks'
import { useMyAddress } from '../../../auth/MyAccountsContext'
import { LineSpacePreview } from '../../../spaces/LineSpacePreview'
import { LoadingSpaces } from '../../../utils/index'
import { MutedDiv } from '../../../utils/MutedText'
import { ProfileSpaceAction } from './index'
import styles from './Index.module.sass'

const IS_CHECKED_MODAL = 'isSwitchProfileModalCheked'

type IsModalCheckedRecord = Record<string, boolean>

const ModalTitle = () => {
  return (
    <>
      <div className='d-flex align-items-center'>
        <div className={styles.UseAsProfileModalTitle}>
          <h2 className='font-weight-bold'>Create profile</h2>
          <MutedDiv>
            On Subsocial, your user profile has a space associated with it. Select a space to use as
            your profile.
          </MutedDiv>
        </div>
      </div>
    </>
  )
}

type ModalBodyProps = {
  spaceId?: string
}

const ModalBody = ({ spaceId }: ModalBodyProps) => {
  const { loading } = useFetchSpaces({ ids: spaceId ? [spaceId] : [] })

  if (!spaceId) return null

  if (loading) return <LoadingSpaces />

  return (
    <>
      <div className={styles.UseAsProfileModalBody}>
        <div>
          <LineSpacePreview spaceId={spaceId} withFollowButton={false} />
        </div>
      </div>
    </>
  )
}

type InnerMakeAsProfileModal = {
  address?: string
  isMySpace: boolean
}

export const InnerMakeAsProfileModal = ({ address, isMySpace }: InnerMakeAsProfileModal) => {
  const [open, setOpen] = useState(false)
  const {
    asPath,
    query: { spaceId: spaceIdFromUrl },
  } = useRouter()
  const spaceId = spaceIdFromUrl?.toString()

  const isModalChecked: IsModalCheckedRecord = store.get(IS_CHECKED_MODAL) || {}

  const hide = () => setOpen(false)

  useEffect(() => {
    if (address && isMySpace && asPath.includes('isFirst') && !isModalChecked?.[address]) {
      setOpen(true)

      isModalChecked[address] = true
      store.set(IS_CHECKED_MODAL, isModalChecked)
    }
  }, [asPath, address])

  return (
    <>
      <Modal
        visible={open}
        title={<ModalTitle />}
        width={540}
        footer={
          <div className={styles.FooterButton}>
            {spaceId && (
              <ProfileSpaceAction
                spaceId={spaceId}
                label='Select space'
                successAction={hide}
                type='primary'
                block
                address={address}
              />
            )}
            <Button onClick={hide} className='m-0 mt-2' type='primary' ghost block>
              No, thanks
            </Button>
          </div>
        }
        className={clsx('DfSignInModal', styles.UseAsProfileModal)}
        onCancel={hide}
        destroyOnClose
      >
        <ModalBody spaceId={spaceId} />
      </Modal>
    </>
  )
}

type MakeAsProfileSpaceProps = {
  isMySpace: boolean
}

const MakeAsProfileModal = (props: MakeAsProfileSpaceProps) => {
  const address = useMyAddress()

  return <InnerMakeAsProfileModal address={address} {...props} />
}

export default MakeAsProfileModal
