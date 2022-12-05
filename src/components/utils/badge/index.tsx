import clsx from 'clsx'
import { BareProps } from '../types'
import styles from './index.module.sass'

type TextBadgeProps = BareProps & {
  text: string
}

export const TextBadge = ({ text, className, ...props }: TextBadgeProps) => {
  return (
    <span className={clsx(styles.Badge, className)} {...props}>
      {text}
    </span>
  )
}
