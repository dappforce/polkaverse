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
      canUseProxy={false}
      params={buildCreateEditorRoleArgs(spaceId)}
      onSuccess={openModal}
      successMessage='Great! Editors enabled!'
    />
  )
}
