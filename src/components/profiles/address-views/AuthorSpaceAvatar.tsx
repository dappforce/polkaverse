// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { AnyAccountId } from '@subsocial/api/types'
import { HTMLProps } from 'react'
import { SpaceAvatar } from 'src/components/spaces/helpers'
import DualAvatar from 'src/components/utils/DualAvatar'
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config'
import { useSelectProfile, useSelectSpace } from 'src/rtk/app/hooks'
import Avatar from './Avatar'

export interface AuthorSpaceAvatarProps extends HTMLProps<HTMLDivElement> {
  size?: number
  authorAddress: string | AnyAccountId
  spaceId?: string
  noMargin?: boolean
}

export default function AuthorSpaceAvatar({
  size = DEFAULT_AVATAR_SIZE,
  authorAddress,
  spaceId,
  noMargin,
  ...props
}: AuthorSpaceAvatarProps) {
  const profile = useSelectProfile(authorAddress.toString())
  const spaceData = useSelectSpace(spaceId)
  const validSpace = spaceData?.id && spaceData.struct.ownerId

  const isSameSpace = profile?.id === spaceId

  const authorAvatar = (
    <Avatar size={size} address={authorAddress} avatar={profile?.content?.image} />
  )

  return (
    <div {...props}>
      {validSpace && !isSameSpace ? (
        <DualAvatar
          noMargin={noMargin}
          leftAvatar={authorAvatar}
          rightAvatarSize={size}
          rightAvatar={
            <SpaceAvatar space={spaceData.struct} avatar={spaceData.content?.image} size={size} />
          }
        />
      ) : (
        authorAvatar
      )}
    </div>
  )
}
