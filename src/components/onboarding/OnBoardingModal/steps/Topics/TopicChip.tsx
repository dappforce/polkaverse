import clsx from 'clsx'
import { HTMLProps } from 'react'
import styles from './TopicChip.module.sass'

export interface TopicChipProps extends HTMLProps<HTMLDivElement> {
  selected?: boolean
}

export default function TopicChip({ className, selected, ...props }: TopicChipProps) {
  return (
    <div
      tabIndex={0}
      {...props}
      className={clsx(styles.Chip, selected && styles.ChipSelected, className)}
    />
  )
}
