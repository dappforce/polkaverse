import Link, { LinkProps } from 'next/link'
import urlJoin from 'src/utils/url-join'
import { useReferralId } from './ReferralUrlChanger'

export default function CustomLink(props: React.PropsWithChildren<LinkProps>) {
  const refId = useReferralId()
  if (refId) {
    props = {
      ...props,
      href: augmentLink(props.href, refId),
      as: props.as && augmentLink(props.as, refId),
    }
  }

  return <Link legacyBehavior {...props} />
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
