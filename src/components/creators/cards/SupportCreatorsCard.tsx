import { Button, Carousel } from 'antd'
import BN from 'bignumber.js'
import clsx from 'clsx'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { DfImage } from 'src/components/utils/DfImage'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getContentStakingLink } from 'src/utils/links'
import styles from './SupportCreatorsCard.module.sass'

const EarnInChatCard = () => {
  return (
    <>
      <div className={styles.ContentInner}>
        <DfImage
          preview={false}
          src='/images/creators/earn-sub-image.png'
          className={clsx(styles.Image)}
        />
        <p className={clsx('FontWeightSemibold FontLarge mb-2', styles.Title)}>
          Earn SUB rewards in chat!
        </p>
        <p className={clsx(styles.Subtitle, 'mb-3')}>
          You can earn SUB rewards by chatting, offering helpful advice, and participating in
          engaging discussions
        </p>
        <Button href={getContentStakingLink()} block shape='round' target='_blank'>
          Learn more
        </Button>
      </div>
      <div className={styles.Gradient1} />
      <div className={styles.Gradient2} />
    </>
  )
}

export default function SupportCreatorsCard() {
  const myAddress = useMyAddress()
  const { data: totalStake } = useFetchTotalStake(myAddress)

  const { amount } = totalStake || {}

  const isStaked = !new BN(amount || '0').isZero()

  return !isStaked ? <StakedCard /> : <NotStakedCard />
}

const data = [
  {
    item: <EarnInChatCard />,
  },
  {
    item: <EarnInChatCard />,
  },
  {
    item: <EarnInChatCard />,
  },
]

const StakedCard = () => {
  return (
    <Carousel autoplay autoplaySpeed={5000} className={styles.CarouselWrapper} dots>
      {data.map((item, index) => (
        <div className={styles.ItemContent} key={index}>
          {item.item}
          <div className={styles.DotsSection}></div>
        </div>
      ))}
    </Carousel>
  )
}

const NotStakedCard = () => {
  const sendEvent = useSendEvent()

  const diamond = (
    <img
      src='/images/creators/diamonds/diamond-list-item.svg'
      className={clsx(styles.OutsideDiamondRight)}
    />
  )

  return (
    <div className={clsx(styles.SupportCreatorsCard)}>
      <div className={styles.Content}>
        <DfImage
          preview={false}
          src='/images/creators/subsocial-tokens.png'
          className={clsx(styles.Image)}
        />
        <p className={clsx('FontWeightSemibold FontLarge mb-2', styles.Title)}>
          How To Earn SUB On The Grill
        </p>
        <p className={clsx(styles.Subtitle, 'mb-3')}>Lock SUB tokens and get rewards when</p>
        <ul className={styles.List}>
          <li className={clsx(styles.ListItem)}>
            {diamond} <span>You like</span>
          </li>
          <li className={clsx(styles.ListItem)}>
            {diamond} <span>You receive likes on posts, comments or messages</span>
          </li>
          <li className={clsx(styles.ListItem)}>
            {diamond} <span>Comments under your posts receive likes</span>
          </li>
        </ul>
        <Button
          href={getContentStakingLink()}
          block
          shape='round'
          target='_blank'
          onClick={() =>
            sendEvent('astake_banner_add_stake', { eventSource: 'support-creators-banner' })
          }
        >
          Lock SUB
        </Button>
      </div>

      <div className={styles.Gradient1} />
      <div className={styles.Gradient2} />
    </div>
  )
}
