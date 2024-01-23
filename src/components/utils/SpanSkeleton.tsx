import { Skeleton } from 'antd'
import { CSSProperties } from 'react'

export type SpanSkeletonProps = {
  style?: CSSProperties
}

export default function SpanSkeleton({ style }: SpanSkeletonProps) {
  return (
    <div className='d-flex align-items-center'>
      <Skeleton.Input
        style={{
          height: '1em',
          width: '15ch',
          marginRight: '4px',
          borderRadius: '20px',
          position: 'relative',
          top: '1px',
          display: 'block',
          ...style,
        }}
      />
    </div>
  )
}
