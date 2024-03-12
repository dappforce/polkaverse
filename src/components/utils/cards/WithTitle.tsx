import { Card } from 'antd'
import clsx from 'clsx'
import React, { FC } from 'react'

export type CardWithTitleProps = {
  title: React.ReactNode
  icon: React.ReactNode
  cardClassName?: string
  className?: string
}

export const CardWithTitle: FC<CardWithTitleProps> = ({
  children,
  title,
  icon,
  cardClassName,
  className,
}) => {
  return (
    <div className={clsx('mt-4', className)}>
      <h2 className='d-flex align-items-center'>
        <span className={'mr-2 d-flex'}>{icon}</span>
        {title}
      </h2>
      <Card className={cardClassName}>{children}</Card>
    </div>
  )
}
