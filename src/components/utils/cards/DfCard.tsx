import clsx from 'clsx'
import { HTMLProps } from 'react'

export type DfCardProps = Omit<HTMLProps<HTMLDivElement>, 'size'> & {
  withShadow?: boolean
  variant?: 'default' | 'info'
  size?: 'medium' | 'small'
}

const variants: Record<NonNullable<DfCardProps['variant']>, string> = {
  default: '',
  info: 'DfCardInfo',
}
export default function DfCard({
  className,
  withShadow = true,
  variant = 'default',
  size = 'medium',
  ...props
}: DfCardProps) {
  return (
    <div
      className={clsx('DfCard', !withShadow && 'NoShadow', variants[variant], size, className)}
      {...props}
    />
  )
}
