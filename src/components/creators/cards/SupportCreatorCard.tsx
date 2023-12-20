import { Button } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { DfImage } from 'src/components/utils/DfImage'
import styles from './SupportCreatorsCard.module.sass'

export type SupportCreatorsCardProps = ComponentProps<'div'>

export default function SupportCreatorsCard({ ...props }: SupportCreatorsCardProps) {
  return (
    <div {...props} className={clsx(props.className, styles.SupportCreatorsCard)}>
      <div className={styles.Content}>
        <span className={clsx('FontWeightSemibold FontLarge mb-2', styles.Title)}>
          Support creators and earn SUB
        </span>
        <span className={clsx(styles.Subtitle)}>
          Generate rewards for both you and this creator by staking towards them
        </span>
        <DfImage src='/images/creators/subsocial-tokens-pink.png' className={clsx(styles.Image)} />
        <Button className='FontWeightMedium'>Stake</Button>
      </div>

      <div className={styles.Gradient1} />
      <div className={styles.Gradient2} />
    </div>
  )
}
