import { Button } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { DfImage } from 'src/components/utils/DfImage'
import styles from './StakeSubBanner.module.sass'

export type StakeSubBannerProps = ComponentProps<'div'>

export default function StakeSubBanner({ ...props }: StakeSubBannerProps) {
  return (
    <div {...props} className={clsx(props.className, styles.StakeSubBanner)}>
      <div className={styles.Content}>
        <p className={clsx(styles.Title, 'mb-2')}>Stake SUB to this creator and earn more</p>
        <p className={clsx(styles.Subtitle, 'mb-4')}>
          Generate rewards for both you and this creator by staking towards them
        </p>
        <Button
          href='https://sub.id/creators'
          target='_blank'
          size='large'
          className={styles.Button}
        >
          Stake
        </Button>
      </div>
      <DfImage src='/images/subsocial-tokens.png' className={styles.Image} />
    </div>
  )
}
