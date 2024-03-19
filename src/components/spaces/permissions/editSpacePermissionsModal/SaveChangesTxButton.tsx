import { useSubsocialApi } from 'src/components/substrate'
import { Loading } from 'src/components/utils'
import TxButton from 'src/components/utils/TxButton'
import { useAppDispatch } from 'src/rtk/app/store'
import { upsertSpaceEditorsBySpaceId } from 'src/rtk/features/accounts/spaceEditorsSlice'
import { eqSet } from 'src/utils/set'
import { buildGrantOrRevokeRoleArgs } from '../../roles/editor-role'
import { newWritePermission } from '../space-permissions'
import { BuiltInRole } from '../utils'

type EditEditorsTxButtonProps = {
  spaceId: string
  roleId?: string
  oldEditors: string[]
  newEditors: string[]
  onClose: () => void
  loadingEditors: boolean
  inititalWhoCanPost: BuiltInRole | 'editors'
  label?: string
}

export const EditEditorsTxButton = ({
  spaceId,
  roleId,
  oldEditors,
  newEditors,
  loadingEditors,
  onClose,
  inititalWhoCanPost,
  label = 'Save changes',
}: EditEditorsTxButtonProps) => {
  const { api, apiState } = useSubsocialApi()
  const dispatch = useAppDispatch()
  const noChangedEditors = eqSet(oldEditors, newEditors)

  if (apiState !== 'READY' || !api || loadingEditors) return <Loading label='Loading editors' />

  const getTxParams = async () => {
    if (!roleId) return []

    const editorsForDelete = oldEditors.filter(editor => !newEditors.includes(editor))

    const batchTxs = []

    if (inititalWhoCanPost !== 'editors') {
      batchTxs.push(
        api.tx.spaces.updateSpace(spaceId, {
          permissions: newWritePermission('space_owner'),
        }),
      )
    }

    if (newEditors.length) {
      batchTxs.push(api.tx.roles.grantRole(...buildGrantOrRevokeRoleArgs(roleId, newEditors)))
    }

    if (editorsForDelete.length) {
      batchTxs.push(
        api.tx.roles.revokeRole(...buildGrantOrRevokeRoleArgs(roleId, editorsForDelete)),
      )
    }

    return [batchTxs]
  }

  const onSuccess = () => {
    dispatch(
      upsertSpaceEditorsBySpaceId({
        id: spaceId,
        spaceEditors: newEditors,
      }),
    )
    onClose()
  }

  return (
    <TxButton
      type='primary'
      label={label}
      params={getTxParams}
      disabled={noChangedEditors}
      canUseProxy={false}
      tx={'utility.batch'}
      onSuccess={onSuccess}
      successMessage='Editors updated'
      failedMessage='Failed to update editors'
    />
  )
}
