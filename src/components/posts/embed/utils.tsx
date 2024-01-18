import { isEmptyStr } from '@subsocial/utils'
import { Popover } from 'antd'

export const supportedEmbeddedLink = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'soundcloud.com',
  'gleev.xyz',
]

const supportedEmbeddedLinkSet = new Set(supportedEmbeddedLink)

export const isSupportedEmbeddedLink = (link?: string) => {
  if (!link || isEmptyStr(link)) return false

  try {
    let { host } = new URL(link)
    host = host.startsWith('www') ? host.slice(4) : host
    return supportedEmbeddedLinkSet.has(host)
  } catch {
    return false
  }
}

const SupportedEmbeddedLinkPopup = () => (
  <div>
    {supportedEmbeddedLink.map(link => (
      <div key={link}>{link}</div>
    ))}
  </div>
)

export const SupportedEmbeddedLink = () => {
  return (
    <div>
      {'We support a limited list of link for embed. '}
      <Popover
        trigger='hover'
        placement='bottom'
        mouseEnterDelay={0.3}
        content={<SupportedEmbeddedLinkPopup />}
      >
        <span className='asLink'>Learn more</span>
      </Popover>
    </div>
  )
}
