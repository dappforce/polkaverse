import { Select } from 'antd'
import messages from 'src/messages'
import { SpaceStruct } from 'src/types'
import { BuiltInRole, getWhoCanPost } from './utils'

type WhoCanPostSelectorProps = {
  space?: SpaceStruct
  onChange?: (type: BuiltInRole) => void
}

export function WhoCanPostSelector(props: WhoCanPostSelectorProps) {
  const { space, onChange } = props
  const { Option } = Select

  return (
    <Select defaultValue={getWhoCanPost(space)} onChange={onChange}>
      <Option value='space_owner'>{messages.forms.permissions.whoCanPost.space_owner}</Option>
      <Option value='follower'>{messages.forms.permissions.whoCanPost.follower}</Option>
    </Select>
  )
}
