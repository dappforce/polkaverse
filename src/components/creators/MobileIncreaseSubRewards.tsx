import { SpaceData } from '@subsocial/api/types'
import clsx from 'clsx'
import Link from 'next/link'
import { ComponentProps } from 'react'
import { useFetchStakeData } from 'src/rtk/features/stakes/stakesHooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import styles from './MobileIncreaseSubRewards.module.sass'

export type MobileIncreaseSubRewardsProps = ComponentProps<'div'> & {
  space: SpaceData
}

export default function MobileIncreaseSubRewards(props: MobileIncreaseSubRewardsProps) {
  const myAddress = useMyAddress()
  const { data } = useFetchStakeData(myAddress ?? '', props.space.id)
  if (!data?.hasStaked) return null

  return (
    <div {...props} className={clsx(props.className, styles.MobileIncreaseSubRewards)}>
      <span className={styles.Title}>Increase SUB rewards</span>
      <Link href='https://polkaverse.com' passHref>
        <a className={styles.Link}>Learn more</a>
      </Link>
      <div className={styles.Gradient} />
    </div>
  )
}
