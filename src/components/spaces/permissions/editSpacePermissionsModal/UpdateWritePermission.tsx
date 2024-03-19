import { TxButtonProps, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import TxButton from 'src/components/utils/TxButton'
import { useCreateReloadSpace } from 'src/rtk/app/hooks'
import { SpaceStruct } from 'src/types'
import { newWritePermission } from '../space-permissions'
import { BuiltInRole } from '../utils'

type UpdateWritePermissionProps = TxButtonProps & {
  onSuccess?: () => void
  space: SpaceStruct
  whoCanPost: BuiltInRole
  label?: string
}

export function EditWritePermission(props: UpdateWritePermissionProps) {
  const { space, label, whoCanPost, onSuccess, ...buttonProps } = props
  const { id } = space
  const reloadSpace = useCreateReloadSpace()

  const newTxParams = () => {
    const update = {
      permissions: newWritePermission(whoCanPost),
    }
    return [id, update]
  }

  const onTxSuccess: TxCallback = () => {
    reloadSpace({ id })
    onSuccess && onSuccess()
  }

  return (
    <TxButton
      {...buttonProps}
      label={label || 'Update permissions'}
      type='primary'
      params={newTxParams}
      tx={'spaces.updateSpace'}
      onSuccess={onTxSuccess}
      failedMessage={'Failed to update permissions of this space'}
      withSpinner
    />
  )
}
