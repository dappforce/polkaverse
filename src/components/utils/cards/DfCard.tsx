import clsx from 'clsx'
import { HTMLProps } from 'react'

export type DfCardProps = HTMLProps<HTMLDivElement>

export default function DfCard({ className, ...props }: DfCardProps) {
  return <div className={clsx('DfCard', className)} {...props} />
}
