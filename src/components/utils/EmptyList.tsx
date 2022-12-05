import { Empty } from 'antd'
import React from 'react'
import { MutedSpan } from './MutedText'

type Props = React.PropsWithChildren<{
  style?: React.CSSProperties
  image?: React.ReactNode
  description?: React.ReactNode
}>

export const NoData = (props: Props) => (
  <Empty
    className='DfEmpty'
    style={props.style}
    image={props.image}
    description={<MutedSpan>{props.description}</MutedSpan>}
  >
    {props.children}
  </Empty>
)

export default NoData
