import Link, { LinkProps } from 'next/link'
import { ComponentProps } from 'react'
import urlJoin from 'src/utils/url-join'
import { useReferralId } from './ReferralUrlChanger'

function getCurrentUrlOrigin() {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

export default function CustomLink(props: ComponentProps<typeof Link>) {
  const refId = useReferralId()
  if (refId) {
    props = {
      ...props,
      href: augmentLink(props.href, refId),
      as: props.as && augmentLink(props.as, refId),
    }
  }

  // If url starts with /c, it will be in a separate app (grill app), so need to give full url
  if (typeof props.href === 'string' && props.href.match(/^\/c(\/.*|(\?.*|#.*)?)$/)) {
    return <a {...props} href={urlJoin(getCurrentUrlOrigin(), props.href, `?ref=${refId}`)} />
  }

  return <Link {...props} legacyBehavior />
}

function augmentLink(link: LinkProps['href'], refId: string) {
  if (typeof link === 'string') {
    if (link.startsWith('http')) return link
    return urlJoin(link, `?ref=${refId}`)
  } else {
    return {
      ...link,
      query:
        typeof link.query === 'string'
          ? urlJoin(link.query, `?ref=${refId}`)
          : {
              ...link.query,
              ref: refId,
            },
    }
  }
}
