import { isEmptyArray } from '@subsocial/utils'
import { useMemo } from 'react'
import { useSubsocialApi } from 'src/components/substrate'
import { TxButtonProps, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import TxButton from 'src/components/utils/TxButton'
import { useCreateReloadSpace } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { useFetchSpaceEditors } from 'src/rtk/features/accounts/accountsHooks'
import { upsertSpaceEditorsBySpaceId } from 'src/rtk/features/accounts/spaceEditorsSlice'
import { SpaceStruct } from 'src/types'
import { buildGrantOrRevokeRoleArgs } from '../../roles/editor-role'
import { newWritePermission } from '../space-permissions'
import useGetRoleId from '../useRoleCreated'
import { BuiltInRole } from '../utils'

type UpdateWritePermissionProps = TxButtonProps & {
  onSuccess?: () => void
  space?: SpaceStruct
  whoCanPost: BuiltInRole
  label?: string
}

export function EditWritePermission(props: UpdateWritePermissionProps) {
  const { space, label, whoCanPost, onSuccess, ...buttonProps } = props
  const { id } = space || {}
  const spaceId = id || ''

  const reloadSpace = useCreateReloadSpace()
  const { spaceEditors: editors = [], loading } = useFetchSpaceEditors(spaceId)
  const { roleId, loaded } = useGetRoleId(spaceId)
  const { api } = useSubsocialApi()
  const dispatch = useAppDispatch()

  const isHaveEditors = !isEmptyArray(editors)

  const newTxParams = () => {
    const update = {
      permissions: newWritePermission(whoCanPost),
    }

    return [id, update]
  }

  const buildBatchTxParams = async () => {
    if (!api || !roleId) return []

    const batchTxs = [
      api.tx.spaces.updateSpace(spaceId, {
        permissions: newWritePermission(whoCanPost),
      }),
    ]

    if (isHaveEditors) {
      batchTxs.push(api.tx.roles.revokeRole(...buildGrantOrRevokeRoleArgs(roleId, editors)))
    }

    return [batchTxs]
  }

  const onTxSuccess: TxCallback = () => {
    reloadSpace({ id: spaceId })
    dispatch(
      upsertSpaceEditorsBySpaceId({
        id: spaceId,
        spaceEditors: [],
      }),
    )
    onSuccess && onSuccess()
  }

  const { tx, params } = useMemo(() => {
    if (!isHaveEditors || loading || !loaded) {
      return {
        tx: 'spaces.updateSpace',
        params: newTxParams,
      }
    } else {
      return {
        tx: 'utility.batch',
        params: buildBatchTxParams,
      }
    }
  }, [loading, loaded, isHaveEditors, whoCanPost])

  return (
    <TxButton
      {...buttonProps}
      label={label || 'Update permissions'}
      type='primary'
      tx={tx}
      params={params}
      canUseProxy={false}
      block
      size='large'
      onSuccess={onTxSuccess}
      failedMessage={'Failed to update permissions of this space'}
      withSpinner
    />
  )
}
