import clsx from 'clsx'
import { HTMLProps } from 'react'
import styles from './index.module.sass'

export interface PaginationIndicatorProps extends HTMLProps<HTMLDivElement> {
  totalPage: number
  currentPage: number
  setCurrentPage: (page: number) => void
}

export default function PaginationIndicator({
  className,
  totalPage,
  currentPage,
  setCurrentPage,
  ...props
}: PaginationIndicatorProps) {
  return (
    <div className={clsx('d-flex align-items-center', 'GapSmall', className)} {...props}>
      {Array.from({ length: totalPage }).map((_, index) => (
        <div
          key={index}
          onClick={() => setCurrentPage(index)}
          className={clsx(styles.Indicator, currentPage === index && styles.IndicatorActive)}
        />
      ))}
    </div>
  )
}
