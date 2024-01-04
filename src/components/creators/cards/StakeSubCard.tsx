import { SpaceData } from '@subsocial/api/types'
import { Button } from 'antd'
import clsx from 'clsx'
import { useResponsiveSize } from 'src/components/responsive'
import { DfImage } from 'src/components/utils/DfImage'
import { getSubIdCreatorsLink } from 'src/utils/links'
import styles from './StakeSubCard.module.sass'

export type StakeSubCardProps = {
  space: SpaceData
}

export default function StakeSubCard({ space }: StakeSubCardProps) {
  const { isSmallMobile, isNotMobile } = useResponsiveSize()
  return (
    <div className={clsx(styles.StakeSubCard)}>
      <div className={styles.Content}>
        <DfImage
          preview={false}
          src='/images/creators/subsocial-tokens.png'
          className={clsx(styles.Image)}
        />
        <p className={clsx(styles.Title, 'mb-2')}>Stake SUB to this creator and earn more</p>
        <p className={clsx(styles.Subtitle, 'mb-3')}>
          Generate rewards for both you and this creator by staking towards them
        </p>
        <Button
          href={getSubIdCreatorsLink(space)}
          target='_blank'
          type='primary'
          block={isSmallMobile || isNotMobile}
        >
          Stake SUB
        </Button>
      </div>
    </div>
  )
}
