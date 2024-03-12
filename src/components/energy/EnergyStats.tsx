import { TiFlashOutline } from 'react-icons/ti'
import styles from './Energy.module.sass'

const EnergyStats = () => {
  const mockedData = [
    { title: 'Energy left', value: '1,240', withEnergyIcon: true },
    { title: 'Transactions left', value: '3,130', withEnergyIcon: false },
  ]

  return (
    <div className={styles.EnergyStatsSection}>
      {mockedData.map((props, i) => (
        <StatsCard key={i} {...props} />
      ))}
    </div>
  )
}

type StatsCardProps = {
  title: string
  value: string
  withEnergyIcon: boolean
}

const StatsCard = ({ title, value, withEnergyIcon }: StatsCardProps) => {
  return (
    <div className={styles.StatsCard}>
      <div className={styles.StatsTitle}>{title}</div>
      <div className={styles.StatsValue}>
        {withEnergyIcon && <TiFlashOutline />}
        <span>{value}</span>
      </div>
    </div>
  )
}

export default EnergyStats
