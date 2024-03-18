import { isEmptyStr } from '@subsocial/utils'
import { Popover } from 'antd'
import { allowEmbedList } from './Embed'

export const isSupportedEmbeddedLink = (link?: string) => {
  if (!link || isEmptyStr(link)) return false

  try {
    return allowEmbedList.find(embed => embed.checker(link))
  } catch {
    return false
  }
}

const SupportedEmbeddedLinkPopup = () => (
  <div>
    {allowEmbedList.map(link => (
      <div key={link.name}>{link.name}</div>
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
