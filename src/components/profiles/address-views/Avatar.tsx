// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { AnyAccountId } from '@subsocial/api/types'
import React, { FC } from 'react'
import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar'
import ViewProfileLink from '../ViewProfileLink'

export type AvatarProps = BaseAvatarProps & {
  asLink?: boolean
  address: AnyAccountId
}

export const Avatar: FC<AvatarProps> = React.memo(
  ({ asLink = true, address, avatarPreview, ...props }) => {
    const baseAvatar = (
      <BaseAvatar
        identityValue={address}
        avatarPreview={avatarPreview && { mask: null }}
        {...props}
      />
    )

    return <>{asLink ? <ViewProfileLink account={{ address }} title={baseAvatar} /> : baseAvatar}</>
  },
)

export default Avatar
