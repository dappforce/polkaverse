import { Card } from 'antd'
import React, { FC } from 'react'

export type CardWithTitleProps = {
  title: React.ReactNode
  icon: React.ReactNode
  cardClassName?: string
}

export const CardWithTitle: FC<CardWithTitleProps> = ({ children, title, icon, cardClassName }) => {
  return (
    <div className={'mt-4'}>
      <h2 className='d-flex align-items-center'>
        <span className={'mr-2 d-flex'}>{icon}</span>
        {title}
      </h2>
      <Card className={cardClassName}>{children}</Card>
    </div>
  )
}
