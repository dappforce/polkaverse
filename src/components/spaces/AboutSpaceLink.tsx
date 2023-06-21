// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import Link from 'next/link'
import { SpaceStruct } from 'src/types'
import { aboutSpaceUrl } from '../urls'

type Props = {
  space: SpaceStruct
  title?: string
  hint?: string
  className?: string
}

export const AboutSpaceLink = ({ space, title, hint, className }: Props) => {
  if (!space.id || !title) return null

  return (
    <Link href='/[spaceId]/about' as={aboutSpaceUrl(space)}>
      <a className={className} title={hint}>
        {title}
      </a>
    </Link>
  )
}

export default AboutSpaceLink
