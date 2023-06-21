// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { nonEmptyStr } from '@subsocial/utils'
import { NamedLink, PostContent, SpaceContent } from 'src/types'

export const getNonEmptySpaceContent = (content: SpaceContent): SpaceContent => {
  const { tags, links, ...rest } = content
  return {
    tags: getNonEmptyStrings(tags),
    links: getNonEmptyLinks(links) as [],
    ...rest,
  }
}

export const getNonEmptyPostContent = (content: PostContent): PostContent => {
  const { tags, ...rest } = content
  return {
    tags: getNonEmptyStrings(tags),
    ...rest,
  }
}

type StringOrNull = string | null

const getNonEmptyStrings = (inputArr: StringOrNull[] = []): string[] => {
  const res: string[] = []
  inputArr.forEach(x => {
    if (nonEmptyStr(x)) {
      res.push(x.trim())
    }
  })
  return res
}

type Link = StringOrNull | NamedLink

const getNonEmptyLinks = (inputArr: Link[] = []): Link[] => {
  const res: Link[] = []
  inputArr.forEach(x => {
    if (nonEmptyStr(x)) {
      res.push(x.trim())
    } else if (x && nonEmptyStr(x.url)) {
      const { name } = x
      res.push({
        name: nonEmptyStr(name) ? name.trim() : name,
        url: x.url.trim(),
      })
    }
  })
  return res
}
