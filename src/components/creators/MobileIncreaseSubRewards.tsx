import clsx from 'clsx'
import { ComponentProps } from 'react'
import { HiChevronRight } from 'react-icons/hi2'
import { SlQuestion } from 'react-icons/sl'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import styles from './MobileIncreaseSubRewards.module.sass'

export type MobileStakerRewardDashboardProps = ComponentProps<'div'>

export default function MobileStakerRewardDashboard(props: MobileStakerRewardDashboardProps) {
  const myAddress = useMyAddress()
  const { data } = useFetchTotalStake(myAddress ?? '')
  if (!data?.hasStaked) return null

  return (
    <div {...props} className={clsx(props.className, styles.MobileIncreaseSubRewards)}>
      <div className={styles.Content}>
        <span className={clsx('d-flex GapTiny align-items-center')}>
          <span className='FontWeightSemibold'>Extra SUB rewards</span>
          <SlQuestion className='FontSmall ColorMuted' />
        </span>
        <div className='d-flex align-items-center GapTiny'>
          <span className='FontWeightSemibold'>
            <span>8</span>
            <span className='ColorMuted'>/10</span>
          </span>
          <HiChevronRight className='ColorMuted FontBig' />
        </div>
      </div>
      <div className={styles.Gradient} />
    </div>
  )
}
