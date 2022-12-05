import { TxCallback } from 'src/components/substrate/SubstrateTxButton'
import { TxDiv } from 'src/components/substrate/TxDiv'
import TxButton from 'src/components/utils/TxButton'
import { PostStruct, SpaceStruct } from 'src/types'

type SetVisibleFn = (visible: boolean) => void

type Props = {
  struct: SpaceStruct | PostStruct
  newTxParams: () => any[]
  type: 'post' | 'space' | 'comment'
  setVisibility?: SetVisibleFn
  label?: string
  asLink?: boolean
  onTxSuccess?: () => void
}

export function HiddenButton(props: Props) {
  const { struct, newTxParams, label, type, asLink, setVisibility, onTxSuccess } = props
  const { hidden } = struct

  const extrinsic = type === 'space' ? 'spaces.updateSpace' : 'posts.updatePost'

  const onSuccess: TxCallback = () => {
    setVisibility && setVisibility(!hidden)
    onTxSuccess && onTxSuccess()
  }

  const TxAction = asLink ? TxDiv : TxButton

  return (
    <TxAction
      className={asLink ? 'm-0' : ''}
      label={label || hidden ? 'Make visible' : `Hide ${type}`}
      size='small'
      params={newTxParams}
      tx={extrinsic}
      onSuccess={onSuccess}
      failedMessage={`Failed to hide your ${type}`}
    />
  )
}

export default HiddenButton
