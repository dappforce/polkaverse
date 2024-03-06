import { nonEmptyArr, nonEmptyStr } from '@subsocial/utils'
import copy from 'copy-to-clipboard'
import { CSSProperties } from 'react'
import { getCurrentUrlOrigin } from 'src/utils/url'
import { showInfoMessage } from '../utils/Message'
import { BareProps } from '../utils/types'

export const openNewWindow = (url: string) => {
  const biggerWindow = window.innerWidth > 650
  window.open(
    url,
    '_blank',
    `toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=${
      biggerWindow ? 600 : 400
    },height=${biggerWindow ? 600 : 400}`,
  )
}

/**
 * Stringify a space's handle by prepending it with '@' char.
 * Example: if a space's handle is 'sport', then its slugified version will be '@sport'.
 */
export function slugifyHandle(slug?: string): string | undefined {
  if (slug && !slug.startsWith('@')) {
    slug = '@' + slug
  }

  return slug
}

export function stringifySubUrls(...subUrls: string[]): string {
  if (nonEmptyArr(subUrls)) {
    const res: string[] = ['']
    subUrls.forEach(url => {
      if (nonEmptyStr(url)) {
        if (url.startsWith('/')) {
          url = url.substring(1) // Drop the first '/'
        }
        res.push(url)
      }
    })
    return res.join('/')
  }
  return ''
}

type ShareLinkProps = {
  url: string
  children: React.ReactNode
}

type BlackLinkProps = BareProps &
  Partial<ShareLinkProps> & {
    onClick?: () => void
  }

export const BlackLink = ({ children, className, style, onClick }: BlackLinkProps) => (
  <a className={'DfBlackLink ' + className} onClick={onClick} style={style}>
    {children}
  </a>
)

export const ShareLink = ({ url, children }: ShareLinkProps) => (
  <BlackLink onClick={() => openNewWindow(url)}>{children}</BlackLink>
)

type CopyProps = {
  text: string
  message: string
  children: React.ReactNode
  style?: CSSProperties
  className?: string
}

export const Copy = ({ text, message, children, style, className }: CopyProps) => (
  <BlackLink
    style={style}
    className={className}
    onClick={() => {
      copy(text)
      showInfoMessage({ message, duration: 3 })
    }}
  >
    {children}
  </BlackLink>
)

export const innerFullUrl = (appBaseUrl: string, relative: string) => {
  if (relative.startsWith('http') || relative.startsWith('https')) return relative

  if (relative.startsWith(appBaseUrl)) return relative

  const base = appBaseUrl.endsWith('/') ? appBaseUrl : appBaseUrl + '/'
  const pathname = relative.startsWith('/') ? relative.substring(1) : relative

  return base + pathname
}

export const fullUrl = (relative: string, externalBaseUrl?: string) => {
  return innerFullUrl(externalBaseUrl || getCurrentUrlOrigin(), relative)
}
