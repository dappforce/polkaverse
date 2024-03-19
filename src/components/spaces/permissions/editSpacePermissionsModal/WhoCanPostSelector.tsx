import { Select } from 'antd'
import messages from 'src/messages'
import { SpaceStruct } from 'src/types'
import { BuiltInRole, useGetSpacePermissionsConfig } from '../utils'

type WhoCanPostSelectorProps = {
  space?: SpaceStruct
  onChange?: (type: BuiltInRole | 'editors') => void
}

export function WhoCanPostSelector(props: WhoCanPostSelectorProps) {
  const { space, onChange } = props
  const { Option } = Select
  const whoCanPost = useGetSpacePermissionsConfig(space)

  return (
    <Select defaultValue={whoCanPost} onChange={onChange}>
      <Option value='space_owner'>{messages.forms.permissions.whoCanPost.space_owner}</Option>
      <Option value='follower'>{messages.forms.permissions.whoCanPost.follower}</Option>
      <Option value='everyone'>{messages.forms.permissions.whoCanPost.everyone}</Option>
      <Option value='editors'>{messages.forms.permissions.whoCanPost.editors}</Option>
    </Select>
  )
}
