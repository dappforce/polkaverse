import { Tooltip } from 'antd'
import { ComponentProps } from 'react'
import { SlQuestion } from 'react-icons/sl'
import { ReactNode } from 'react-markdown'
import DfCard from 'src/components/utils/cards/DfCard'
import styles from './StatisticCard.module.sass'

export type StatisticCardProps = ComponentProps<'div'> & {
  title: string
  value: ReactNode
  tooltip: string
}

export default function StatisticCard({ title, tooltip, value, ...props }: StatisticCardProps) {
  return (
    <DfCard {...props} size='small' className={styles.StatisticCard} withShadow={false}>
      <div className='d-flex align-items-center ColorMuted GapTiny'>
        <span className='FontSmall'>{title}</span>
        <Tooltip title={tooltip}>
          <SlQuestion className='FontTiny' style={{ flexShrink: 0 }} />
        </Tooltip>
      </div>
      <div className='d-flex align-items-center justify-content-between GapSmall mt-1'>
        <span className={styles.StatisticNumber}>{value}</span>
      </div>
    </DfCard>
  )
}
