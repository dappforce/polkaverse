import { SpaceData } from '@subsocial/api/types'
import { Popover } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { SpacePreview } from './LineSpacePreview'

export type SpacePreviewPopupProps = ComponentProps<'div'> & {
  space: SpaceData
  content: JSX.Element
}

export default function SpacePreviewPopup({ content, space, ...props }: SpacePreviewPopupProps) {
  return (
    <Popover trigger='hover' mouseEnterDelay={0.3} content={<SpacePopupContent space={space} />}>
      <div {...props} className={clsx('d-flex align-items-center', props.className)}>
        {content}
      </div>
    </Popover>
  )
}

function SpacePopupContent({ space }: { space: SpaceData }) {
  return <SpacePreview space={space} />
}
