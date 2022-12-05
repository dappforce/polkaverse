import { Tag } from 'antd'
import React from 'react'
import { useResponsiveSize } from '../responsive'

type Props = React.PropsWithChildren<{
  isMy?: boolean
  className?: string
}>

export const MyEntityLabel = ({ isMy = false, className, children }: Props) => {
  const { isNotMobile } = useResponsiveSize()
  return isNotMobile && isMy ? (
    <Tag color='green' className={className}>
      {children}
    </Tag>
  ) : null
}
export default MyEntityLabel
