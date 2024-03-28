import { Button, Carousel } from 'antd'
import BN from 'bignumber.js'
import clsx from 'clsx'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { DfImage } from 'src/components/utils/DfImage'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getContentStakingLink } from 'src/utils/links'
import styles from './SupportCreatorsCard.module.sass'

type BannerCardProps = {
  title: React.ReactNode
  subtitle: React.ReactNode
  imagePath: string
  learnMoreHref: string
  buttonLabel: string
  backgroundColor: string
  titleColor: string
}

const BannerCard = ({
  title,
  subtitle,
  imagePath,
  learnMoreHref,
  buttonLabel,
  titleColor,
}: BannerCardProps) => {
  const sendEvent = useSendEvent()

  return (
    <>
      <div className={styles.ContentInner}>
        <div className={styles.Info}>
          <DfImage preview={false} src={imagePath} className={clsx(styles.Image)} />
          <p
            className={clsx('FontWeightSemibold mb-2', styles.Title)}
            style={{ color: titleColor }}
          >
            {title}
          </p>
          {subtitle}
        </div>
        <Button
          href={learnMoreHref}
          onClick={() =>
            sendEvent('learn_more_banner', {
              value: learnMoreHref,
            })
          }
          className={styles.LearnMoreButton}
          block
          shape='round'
          target='_blank'
        >
          {buttonLabel}
        </Button>
      </div>
    </>
  )
}

export default function SupportCreatorsCard() {
  const myAddress = useMyAddress()
  const { data: totalStake } = useFetchTotalStake(myAddress)

  const { amount } = totalStake || {}

  const isStaked = !new BN(amount || '0').isZero()

  return isStaked ? <StakedCard /> : <NotStakedCard />
}

const EngageToEarnSubtitle = () => {
  const diamond = (
    <img
      src='/images/creators/diamonds/diamond-list-item.svg'
      className={clsx(styles.OutsideDiamondRight)}
    />
  )
  return (
    <>
      <p className={clsx(styles.Subtitle, 'mb-3')}>Lock SUB and get rewards when you:</p>
      <ul className={styles.List}>
        <li className={clsx(styles.ListItem)}>
          {diamond} <span>Like posts</span>
        </li>
        <li className={clsx(styles.ListItem)}>
          {diamond} <span>Get engagement or likes on your content</span>
        </li>
      </ul>
    </>
  )
}

const StakedCard = () => {
  // EDIT ME: manage banners in carousel
  const data = [
    {
      title: 'Engage-To-Earn',
      subtitle: <EngageToEarnSubtitle />,

      imagePath: '/images/creators/engage-to-earn.png',
      learnMoreHref: getContentStakingLink(),
      buttonLabel: 'Start Earning',
      backgroundColor: '#DFEFFF',
      titleColor: '#4972E9',
    },
    {
      title: 'Chat Monetization',
      subtitle: (
        <p className={clsx(styles.Subtitle, 'mb-3')}>
          Join conversations, share your thoughts, and connect with others to start earning every
          time your messages receive likes.
        </p>
      ),
      imagePath: '/images/creators/chat-monetization.png',
      learnMoreHref: 'https://grillapp.net/c/hot-chats',
      buttonLabel: 'Explore Chats',
      backgroundColor: '#DFFFDF',
      titleColor: '#30AD30',
    },
    {
      title: 'Establish Your Brand',
      subtitle: (
        <p className={clsx(styles.Subtitle, 'mb-3')}>
          Secure your username and create your brand identity on Grill to stand out, be recognized,
          and start growing your community.
        </p>
      ),
      imagePath: '/images/creators/establish-your-brand.png',
      learnMoreHref: 'https://grillapp.net/dd',
      buttonLabel: 'Register Username',
      backgroundColor: '#ECF1FF',
      titleColor: '#0F172A',
    },
    {
      title: 'Seamless Access',
      subtitle: (
        <p className={clsx(styles.Subtitle, 'mb-3')}>
          Save your Grill key or QR code for hassle-free login access to Grill across all of your
          devices.
        </p>
      ),
      imagePath: '/images/creators/seamless-access.png',
      learnMoreHref: 'https://grillapp.net/@olehmell/lets-use-login-with-grill-key-100229',
      buttonLabel: 'Learn more',
      backgroundColor: '#C0FEF3',
      titleColor: '#1A3D7A',
    },
  ]

  return (
    <Carousel autoplay autoplaySpeed={5000} className={styles.CarouselWrapper} pauseOnHover dots>
      {data.map((item, index) => (
        <div key={index}>
          <div className={styles.ItemContent} style={{ backgroundColor: item.backgroundColor }}>
            <BannerCard {...item} />
            {data.length > 1 && <div className={styles.DotsSection}></div>}
          </div>
        </div>
      ))}
    </Carousel>
  )
}

const NotStakedCard = () => {
  const sendEvent = useSendEvent()

  const diamond = (
    <img
      src='/images/creators/diamonds/diamond-small.svg'
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
        <p className={clsx(styles.Subtitle, 'mb-2')}>Lock SUB tokens and get rewards when</p>
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
