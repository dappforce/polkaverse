import { SpaceUpdate } from '@subsocial/api/substrate/wrappers'
import { useDispatch } from 'react-redux'
import { fetchSpace } from 'src/rtk/features/spaces/spacesSlice'
import { DataSourceTypes, SpaceStruct } from 'src/types'
import { useSubsocialApi } from '../substrate'
import HiddenButton from '../utils/HiddenButton'

type HiddenSpaceButtonProps = {
  space: SpaceStruct
  asLink?: boolean
}

export function HiddenSpaceButton(props: HiddenSpaceButtonProps) {
  const dispatch = useDispatch()
  const { subsocial } = useSubsocialApi()
  const { space } = props
  const { hidden } = space

  const newTxParams = () => {
    const update = SpaceUpdate({
      hidden: !hidden,
    })

    return [space.id, update]
  }

  const onTxSuccess = () => {
    dispatch(
      fetchSpace({ api: subsocial, id: space.id, dataSource: DataSourceTypes.CHAIN, reload: true }),
    )
  }

  return (
    <HiddenButton
      type='space'
      newTxParams={newTxParams}
      struct={space}
      onTxSuccess={onTxSuccess}
      {...props}
    />
  )
}

export default HiddenSpaceButton
