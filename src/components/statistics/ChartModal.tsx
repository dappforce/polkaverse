import { AreaChart, AreaChartProps } from '@opd/g2plot-react'
import { Divider } from 'antd'
import Modal from 'antd/lib/modal'
import clsx from 'clsx'
import messages from 'src/messages'
import { periodOpt, StatisticsDataType } from './Statistics'
import styles from './Statistics.module.sass'

type ModalProps = {
  open: boolean
  onClose: () => void
  statisticData: StatisticsDataType | undefined
  period: string | undefined
}

export const ChartModalView = ({ open, onClose, statisticData, period }: ModalProps) => {
  if (!statisticData) return null
  const { graphData, activityType, totalCount, todayCount: todayCount } = statisticData

  const config: AreaChartProps = {
    padding: 'auto',
    autoFit: true,
    data: graphData,
    xField: 'x',
    yField: 'y',
    tooltip: {
      domStyles: {
        'g2-tooltip-marker': {
          marginRight: '0',
        },
        'g2-tooltip-list-item': {
          textAlign: 'left',
          marginLeft: '1px',
        },
        'g2-tooltip-value': {
          marginLeft: '0',
          float: 'none',
        },
      },
      formatter: datum => {
        return { name: '', value: datum.y }
      },
    },
    smooth: true,
    areaStyle: { fill: '#ffb3ea', fillOpacity: 1 },
    color: '#bd018b',
  }

  const selectedPeriod = periodOpt.find(item => item.value === period)

  return (
    <Modal
      visible={open}
      title={
        <h3 className='font-weight-bold m-0'>{`${messages.statistics[activityType]} (${selectedPeriod?.label})`}</h3>
      }
      footer={null}
      width={900}
      className={clsx('text-center', styles.DfChartModal)}
      onCancel={onClose}
    >
      <AreaChart {...config} />
      <Divider />
      {totalCount} total, {todayCount} today
    </Modal>
  )
}

export const GraphModal = (props: ModalProps) => {
  return <ChartModalView {...props} />
}

export default GraphModal
