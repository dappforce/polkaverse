// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { VoidFn } from '@polkadot/api/types'
import { buildCreateEditorRoleArgs } from 'src/components/spaces/roles/editor-role'
import { TxDiv } from 'src/components/substrate/TxDiv'
import { SpaceId } from 'src/types'

type EnableEditorsButtonProps = {
  spaceId: SpaceId
  openModal: VoidFn
}

export const EnableEditorsButton = ({ spaceId, openModal }: EnableEditorsButtonProps) => {
  return (
    <TxDiv
      label='Enable editors'
      tx={'roles.createRole'}
      params={buildCreateEditorRoleArgs(spaceId)}
      onSuccess={openModal}
      successMessage='Great! Editors enabled!'
    />
  )
}
