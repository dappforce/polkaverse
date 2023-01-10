import clsx from 'clsx'
import { HTMLProps } from 'react'
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config'
import styles from './index.module.sass'

export interface DualAvatarProps extends HTMLProps<HTMLDivElement> {
  leftAvatar: JSX.Element
  rightAvatar: JSX.Element
  noMargin?: boolean
  rightAvatarSize?: number
}

const RIGHT_IMAGE_OFFSET = 60

export default function DualAvatar({
  className,
  leftAvatar,
  rightAvatar,
  rightAvatarSize = DEFAULT_AVATAR_SIZE,
  noMargin,
}: DualAvatarProps) {
  return (
    <div className={clsx(!noMargin && 'mr-2', className)}>
      <div
        className={clsx(styles.DualAvatar)}
        style={{ marginRight: `${(rightAvatarSize * RIGHT_IMAGE_OFFSET) / 100}px` }}
      >
        <div className={clsx(styles.LeftAvatar)}>{rightAvatar}</div>
        <div className={clsx(styles.RightAvatar)} style={{ left: `${RIGHT_IMAGE_OFFSET}%` }}>
          {leftAvatar}
        </div>
      </div>
    </div>
  )
}
