import { Image } from 'antd'
import Link, { LinkProps } from 'next/link'
import React, { CSSProperties, ReactNode } from 'react'
import { resolveIpfsUrl } from 'src/ipfs'

export type PreviewType = {
  mask?: ReactNode
}

export type BgImgProps = {
  src: string
  size?: number | string
  height?: number | string
  width?: number | string
  rounded?: boolean
  className?: string
  preview?: boolean | PreviewType
  style?: CSSProperties
  wrapperClassName?: string
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export const DfBgImg = React.memo((props: BgImgProps) => {
  const {
    src,
    size,
    height = size,
    width = size,
    rounded = false,
    className,
    style,
    preview,
    wrapperClassName,
    onLoad,
  } = props

  const fullClass = 'DfBgImg ' + className

  const fullStyle = Object.assign(
    {
      width: width,
      height: height,
      minWidth: width,
      minHeight: height,
      borderRadius: rounded && '50%',
    },
    style,
  )

  return (
    <Image
      onLoad={onLoad}
      wrapperClassName={wrapperClassName}
      src={resolveIpfsUrl(src)}
      className={fullClass}
      style={fullStyle}
      preview={preview || false}
    />
  )
})

type DfBgImageLinkProps = BgImgProps & LinkProps

export const DfBgImageLink = React.memo(({ href, as, ...props }: DfBgImageLinkProps) => (
  <div>
    <Link href={href} as={as}>
      <a>
        <DfBgImg {...props} />
      </a>
    </Link>
  </div>
))
