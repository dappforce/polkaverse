// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import Link from 'next/link'
import React from 'react'
import { SpaceData } from 'src/types'
import { spaceUrl } from '../urls'
import { useStorybookContext } from '../utils/StorybookContext'

type Props = {
  space?: SpaceData
  subtitle: React.ReactNode
}

export const SpacedSectionTitle = ({ space, subtitle }: Props) => {
  const { isStorybook } = useStorybookContext()
  const name = space?.content?.name

  return (
    <>
      {!isStorybook && space && name && (
        <>
          <Link href='/[spaceId]' as={spaceUrl(space.struct)}>
            <a>{name}</a>
          </Link>
          <span style={{ margin: '0 .75rem' }}>/</span>
        </>
      )}
      {subtitle}
    </>
  )
}

export default SpacedSectionTitle
