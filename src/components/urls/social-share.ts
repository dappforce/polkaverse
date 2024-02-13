import { isClientSide } from '../utils'
import { fullUrl } from './helpers'

const SUBSOCIAL_TAGS = Array.from(new Set(['CreatorEconomy', 'Subsocial']))

// TODO should we use fullUrl() here?
export const subsocialUrl = (url: string) =>
  isClientSide() ? `${window.location.origin}${url}` : ''

type OptionsType = {
  tags?: string[]
  externalBaseUrl?: string
}

export const twitterShareUrl = (url: string, text?: string, options?: OptionsType) => {
  const tags = options?.tags
  const textVal = text ? `text=${encodeURIComponent(text)}` : ''
  const resolvedUrl = fullUrl(url, options?.externalBaseUrl)

  return `https://twitter.com/intent/tweet?${textVal}&url=${encodeURIComponent(
    resolvedUrl + '\n\n',
  )}&hashtags=${[...SUBSOCIAL_TAGS, ...(tags || [])].filter(Boolean)}&original_referer=${url}`
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
