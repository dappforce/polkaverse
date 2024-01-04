import { Image } from 'antd'
import React from 'react'

type Props = {
  src: string
  size?: string | number
  rounded?: boolean
  className?: string
  preview?: boolean
}

// TODO: create props onError
export const DfImage = (props: Props) => {
  const { src, size, rounded, className, preview = true } = props
  const style: React.CSSProperties = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    overflow: 'hidden',
    borderRadius: rounded ? '50%' : undefined,
    cursor: preview ? 'pointer' : undefined,
  }

  return (
    <div style={style} className={className}>
      <Image src={src} preview={preview ? { mask: null } : false} />
    </div>
  )
}
