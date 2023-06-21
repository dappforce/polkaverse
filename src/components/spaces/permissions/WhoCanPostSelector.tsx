// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
      <Option value='everyone'>{messages.forms.permissions.whoCanPost.everyone}</Option>
    </Select>
  )
}
