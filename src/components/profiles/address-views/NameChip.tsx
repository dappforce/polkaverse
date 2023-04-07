import { Tooltip } from 'antd'
import clsx from 'clsx'
import styles from './NameChip.module.sass'

export default function NameChip({ ...props }) {
  return (
    <div className='ml-auto'>
      <Tooltip
        className='ml-2'
        placement='bottomRight'
        title={
          <>
            <div>This account</div>
            <div>is registered with</div>
            <div>email</div>
          </>
        }
      >
        <div {...props} className={clsx(styles.Chip)} />
      </Tooltip>
    </div>
  )
}
