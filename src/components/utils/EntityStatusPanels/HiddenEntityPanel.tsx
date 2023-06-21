// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import HiddenPostButton from 'src/components/posts/HiddenPostButton'
import HiddenSpaceButton from 'src/components/spaces/HiddenSpaceButton'
import { PostStruct, SpaceStruct } from 'src/types'
import { EntityStatusPanel, EntityStatusProps } from './EntityStatusPanel'

type Props = EntityStatusProps & {
  kind: 'space' | 'post' | 'comment'
  struct: SpaceStruct | PostStruct
}

export const HiddenEntityPanel = ({ kind, struct, ...otherProps }: Props) => {
  // If the entity is not hidden or it's not my entity
  if (!struct.hidden) return null

  const HiddenButton = () =>
    kind === 'space' ? (
      <HiddenSpaceButton space={struct as SpaceStruct} />
    ) : (
      <HiddenPostButton post={struct as PostStruct} />
    )

  return (
    <EntityStatusPanel
      desc={`This ${kind} is unlisted and only you can see it`}
      actions={[<HiddenButton key='hidden-button' />]}
      {...otherProps}
    />
  )
}

export default HiddenEntityPanel
