// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { PlusOutlined } from '@ant-design/icons'
import { ButtonProps } from 'antd/lib/button'
import React from 'react'
import { isHidden } from 'src/components/utils'
import { ButtonLink } from 'src/components/utils/CustomLinks'
import { useHasUserASpacePermission } from 'src/permissions/checkPermission'
import { createNewPostLinkProps, SpaceProps } from './common'

type Props = SpaceProps &
  ButtonProps & {
    title?: React.ReactNode
  }

const CreatePostIcon = <PlusOutlined />

export const CreatePostButton = (props: Props) => {
  const { space, title = 'Create post' } = props
  const canWritePost = useHasUserASpacePermission({ space, permission: 'CreatePosts' })

  if (isHidden(space)) return null

  return canWritePost ? (
    <ButtonLink
      {...props}
      type='primary'
      icon={CreatePostIcon}
      ghost
      {...createNewPostLinkProps(space)}
    >
      {' '}
      {title}
    </ButtonLink>
  ) : null
}
