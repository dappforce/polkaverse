// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import config from 'src/config'
import { isClientSide } from '../utils'
import { fullUrl } from './helpers'

const SUBSOCIAL_TAGS = Array.from(new Set([config.appName, 'Subsocial']))

// TODO should we use fullUrl() here?
export const subsocialUrl = (url: string) =>
  isClientSide() ? `${window.location.origin}${url}` : ''

type OptionsType = {
  tags?: string[]
  externalBaseUrl?: string
}

export const twitterShareUrl = (url: string, text?: string, options?: OptionsType) => {
  const tags = options?.tags
  const textVal = text ? `text=${text}` : ''
  const resolvedUrl = fullUrl(url, options?.externalBaseUrl)

  return encodeURI(
    `https://twitter.com/intent/tweet?${textVal}&url=${resolvedUrl + '\n\n'}&hashtags=${[
      SUBSOCIAL_TAGS,
      ...(tags || []),
    ]}&original_referer=${url}`,
  )
}

export const linkedInShareUrl = (url: string, title?: string, summary?: string) => {
  const titleVal = title ? `title=${title}` : ''
  const summaryVal = summary ? `summary=${summary}` : ''

  return encodeURI(
    `https://www.linkedin.com/shareArticle?mini=true&url=${subsocialUrl(
      url,
    )}&${titleVal}&${summaryVal}`,
  )
}

export const facebookShareUrl = (url: string) =>
  encodeURI(`https://www.facebook.com/sharer/sharer.php?u=${subsocialUrl(url)}`)

export const redditShareUrl = (url: string, title?: string) => {
  const titleVal = title ? `title=${title}` : ''

  return encodeURI(`http://www.reddit.com/submit?url=${subsocialUrl(url)}&${titleVal}`)
}

export const copyUrl = (url: string) => subsocialUrl(url)
