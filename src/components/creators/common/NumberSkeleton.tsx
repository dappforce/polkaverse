import { Skeleton } from 'antd'

export default function NumberSkeleton() {
  return (
    <div className='d-flex align-items-center'>
      <Skeleton.Input
        style={{
          height: '1em',
          width: '3ch',
          marginRight: '4px',
          borderRadius: '20px',
          position: 'relative',
          top: '1px',
          display: 'block',
        }}
      />
    </div>
  )
}
