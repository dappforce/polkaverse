// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useState } from 'react'
import { CreateSpaceButton } from 'src/components/spaces/helpers'
import CustomModal from 'src/components/utils/CustomModal'
import MySpacesForSwitchModal from './MySpacesForSwitchModal'

type SwitchSpaceProfileModalProps = {
  open: boolean
  hide: () => void
}

export const SwitchSpaceProfileModal = ({ open, hide }: SwitchSpaceProfileModalProps) => (
  <CustomModal
    title='Choose a space for your profile'
    subtitle='On Subsocial, your profile is always associated with one of your spaces. Choose which space you want to use as your default profile space, or create a new one.'
    visible={open}
    onCancel={hide}
    footer={
      <CreateSpaceButton size='large' block ghost type='primary'>
        Create a space
      </CreateSpaceButton>
    }
  >
    <MySpacesForSwitchModal hide={hide} />
  </CustomModal>
)

export const SwitchProfileSpaceButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <a onClick={() => setOpen(true)}>Change profile</a>
      <SwitchSpaceProfileModal open={open} hide={() => setOpen(false)} />
    </>
  )
}
