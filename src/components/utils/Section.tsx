import clsx from 'clsx'
import React from 'react'
import { BareProps } from 'src/components/utils/types'

type Props = React.PropsWithChildren<
  BareProps & {
    id?: string
    className?: string
    outerClassName?: string
    title?: React.ReactNode
    level?: number
    withLargerMaxWidth?: boolean
  }
>

export const Section = ({
  title,
  level = 2,
  className,
  id,
  outerClassName,
  children,
  withLargerMaxWidth,
}: Props) => {
  const renderTitle = () => {
    if (!title) return null

    const className = 'DfSection-title'
    return React.createElement(`h${level}`, { className }, title)
  }

  return (
    <div
      className={clsx(outerClassName, withLargerMaxWidth && 'DfSectionLarger', 'DfSectionOuter')}
    >
      <section id={id} className={`DfSection ${className}`}>
        {renderTitle()}
        {children}
      </section>
    </div>
  )
}

export default Section
