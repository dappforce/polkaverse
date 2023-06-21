// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar'
import { SpaceStruct } from 'src/types'
import ViewSpaceLink from '../ViewSpaceLink'

type Props = Omit<BaseAvatarProps, 'identityValue'> & {
  space: SpaceStruct
  asLink?: boolean
  isUnnamedSpace?: boolean
}

export const SpaceAvatar = ({ asLink = true, isUnnamedSpace = false, space, ...props }: Props) =>
  asLink ? (
    <ViewSpaceLink
      space={space}
      title={<BaseAvatar identityValue={isUnnamedSpace ? space.id : space.ownerId} {...props} />}
    />
  ) : (
    <BaseAvatar identityValue={isUnnamedSpace ? space.id : space.ownerId} {...props} />
  )
