import { Collapse, Divider, Dropdown } from 'antd'
import clsx from 'clsx'
import { IoFlashOutline } from 'react-icons/io5'
import { useAuth } from '../auth/AuthContext'
import { ButtonLink } from '../utils/CustomLinks'
import { MutedDiv } from '../utils/MutedText'
import { BareProps } from '../utils/types'
import styles from './Energy.module.sass'
import { EnergyStatus } from './utils'

export type CommonEnergyProps = {
  status: EnergyStatus
}

const energyColors: { [key in EnergyStatus]: string } = {
  low: '#E89C29',
  normal: '#94A3B8',
  zero: '#F5222D',
}

export const EnergyIndicator = ({ status }: CommonEnergyProps & BareProps) => (
  <div className={clsx(styles.EnergyIndicator, styles[`Energy_${status}`])}>
    <IoFlashOutline
      className={clsx(styles.EnergyIcon)}
      size='1.5rem'
      color={energyColors[status]}
    />
  </div>
)

const { Panel } = Collapse

const DropdownOverlay = () => {
  const {
    energy: { transactionsCount, coefficient, status },
  } = useAuth()

  return (
    <div className={styles.DropdownOverlay}>
      <div className={styles.DropdownOverlayContent}>
        <div className='mb-2'>
          <MutedDiv>Transactions left:</MutedDiv>
          <div className={clsx(styles.CallsValue)}>
            <span
              className={clsx({
                [styles.CallsLowValue]: status === 'low',
                [styles.CallsZeroValue]: status === 'zero',
              })}
            >
              {transactionsCount === 0
                ? transactionsCount.toString()
                : `~ ${transactionsCount.toFixed(0)}`}
            </span>
          </div>
        </div>
        <div>
          <MutedDiv>Energy coefficient:</MutedDiv>
          <div className={styles.CallsValue}>x{coefficient}</div>
        </div>
        <ButtonLink
          className='mt-2'
          block
          type='primary'
          href='/energy'
          target='_blank'
          rel='noreferrer'
        >
          Get more energy
        </ButtonLink>
      </div>

      <Divider className='mt-3 mb-3' />

      <Collapse ghost className={styles.OverlayCollapse}>
        <Panel header='What is energy?' key='1'>
          <MutedDiv>
            Energy lets you use Subsocial to make posts, follow your friends, like their content,
            etc. NRG can be created by burning SUB tokens, and enables you to perform {coefficient}x
            more actions than if you used SUB.
          </MutedDiv>
        </Panel>
      </Collapse>
    </div>
  )
}

const EnergyDropdown = () => {
  const {
    energy: { status },
  } = useAuth()

  return (
    <>
      <Dropdown
        overlay={<DropdownOverlay />}
        placement={'bottomCenter'}
        trigger={['hover', 'click']}
      >
        <div>
          <EnergyIndicator className={styles.OnlyProgress} status={status} />
        </div>
      </Dropdown>
    </>
  )
}

export default EnergyDropdown
