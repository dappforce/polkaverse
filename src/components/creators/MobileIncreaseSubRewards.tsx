import { SpaceData } from '@subsocial/api/types'
import clsx from 'clsx'
import Link from 'next/link'
import { ComponentProps } from 'react'
import { useFetchStakeData } from 'src/rtk/features/creators/stakesHooks'
import { activeStakingLinks } from 'src/utils/links'
import { useMyAddress } from '../auth/MyAccountsContext'
import { MutedSpan } from '../utils/MutedText'
import styles from './MobileIncreaseSubRewards.module.sass'

export type MobileIncreaseSubRewardsProps = ComponentProps<'div'> & {
  space?: SpaceData
  isActiveStakingBanner?: boolean
}

export default function MobileIncreaseSubRewards(props: MobileIncreaseSubRewardsProps) {
  const { space, isActiveStakingBanner } = props
  const myAddress = useMyAddress()
  const { data } = useFetchStakeData(myAddress ?? '', space?.id || '')
  if (!data?.hasStaked && space?.id) return null

  return (
    <div
      {...props}
      className={clsx(
        props.className,
        styles.MobileIncreaseSubRewards,
        isActiveStakingBanner && styles.ActiveStakingBanner,
      )}
    >
      <span className={styles.Title}>
        {isActiveStakingBanner ? 'Active Staking' : 'Increase SUB rewards'}
      </span>
      {isActiveStakingBanner ? (
        <MutedSpan className={styles.Link}>Coming soon</MutedSpan>
      ) : (
        <Link href={activeStakingLinks.learnMore} passHref>
          <a target='_blank' className={styles.Link}>
            Learn more
          </a>
        </Link>
      )}
      <div className={styles.Gradient} />
    </div>
  )
}
