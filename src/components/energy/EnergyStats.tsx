import { QuestionCircleOutlined } from '@ant-design/icons'
import { convertToBalanceWithDecimal } from '@subsocial/utils'
import { Tooltip } from 'antd'
import BN from 'bignumber.js'
import { TiFlashOutline } from 'react-icons/ti'
import { useAuth } from '../auth/AuthContext'
import { useSubstrate } from '../substrate'
import TokenBalance from '../utils/TokenBalance'
import styles from './Energy.module.sass'

const EnergyStats = () => {
  const {
    energy: { transactionsCount, energyBalance },
  } = useAuth()
  const { tokenDecimal } = useSubstrate()

  const energyBalanceWithDecimal =
    energyBalance && tokenDecimal
      ? convertToBalanceWithDecimal(energyBalance.toString(), tokenDecimal)
      : new BN(0)

  const energyLeft = <TokenBalance value={energyBalanceWithDecimal.toString()} />
  const transactionsLeft = <TokenBalance value={transactionsCount.toString()} />

  const data = [
    {
      title: 'Energy left',
      value: energyLeft,
      withEnergyIcon: true,
      tooltipText:
        'The amount of energy you have left. Please generate more energy before this reaches 0.',
    },
    {
      title: 'Transactions left',
      value: transactionsLeft,
      withEnergyIcon: false,
      tooltipText:
        'How many transactions you can do with your remaining energy. Please generate more energy before this reaches 0.',
    },
  ]

  return (
    <div className={styles.EnergyStatsSection}>
      {data.map((props, i) => (
        <StatsCard key={i} {...props} />
      ))}
    </div>
  )
}

type StatsCardProps = {
  title: string
  value: React.ReactNode
  withEnergyIcon: boolean
  tooltipText: string
}

const StatsCard = ({ title, value, withEnergyIcon, tooltipText }: StatsCardProps) => {
  return (
    <div className={styles.StatsCard}>
      <div className={styles.StatsTitle}>
        {title}{' '}
        <Tooltip className='ml-2' title={tooltipText}>
          <QuestionCircleOutlined style={{ color: '#94A3B8' }} />
        </Tooltip>
      </div>
      <div className={styles.StatsValue}>
        {withEnergyIcon && <TiFlashOutline />}
        <span>{value}</span>
      </div>
    </div>
  )
}

export default EnergyStats
