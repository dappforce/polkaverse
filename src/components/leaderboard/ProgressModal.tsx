import { Button } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import html2canvas from 'html2canvas'
import { useEffect, useState } from 'react'
import { ReactNode } from 'react-markdown'
import CustomModal from 'src/components/utils/CustomModal'
import { resolveIpfsUrl } from 'src/ipfs'
import { useFetchProfileSpace, useSelectProfile } from 'src/rtk/app/hooks'
import { useFetchUserPrevReward } from 'src/rtk/features/activeStaking/hooks'
import { PrevRewardStatus } from 'src/rtk/features/activeStaking/prevRewardSlice'
import { resizeImage } from 'src/utils/image'
import { useMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import { useDefaultSpaceIdToPost } from '../posts/editor/ModalEditor'
import Avatar from '../profiles/address-views/Avatar'
import { useIsMobileWidthOrDevice, useResponsiveSize } from '../responsive'
import { useSubsocialApi } from '../substrate'
import { twitterShareUrl } from '../urls'
import { fullUrl, openNewWindow } from '../urls/helpers'
import { DfImage } from '../utils/DfImage'
import DiamondIcon from '../utils/icons/Diamond'
import { controlledMessage } from '../utils/Message'
import styles from './ProgressModal.module.sass'

const progressModalStorage = {
  getIsClosed: () => {
    const today = dayjs.utc().startOf('day').unix()
    const closedTimestamp = localStorage.getItem('progress-modal-closed')
    if (!closedTimestamp) return false
    return today === Number(closedTimestamp)
  },
  close: () => {
    const today = dayjs.utc().startOf('day').unix()
    localStorage.setItem('progress-modal-closed', String(today))
  },
}

export default function ProgressModal() {
  const [shouldShowModal, setShouldShowModal] = useState(false)
  const myAddress = useMyAddress()

  useEffect(() => {
    setShouldShowModal(true)
    // setShouldShowModal(!progressModalStorage.getIsClosed() && !!myAddress)
  }, [myAddress])

  if (!shouldShowModal) return null

  return <InnerProgressModal />
}

type DisplayedStatus = Exclude<PrevRewardStatus, 'none'>
const statusClassName: Record<DisplayedStatus, string> = {
  full: styles.Full,
  half: styles.Halfway,
}

const titles: Record<'lastWeek' | 'yesterday', Record<DisplayedStatus, string[]>> = {
  lastWeek: {
    full: [
      'Week Striker',
      'Marathoner',
      'Week Wizard',
      'Praise Pirate',
      'Like Legend',
      'Consistent Champion',
      'Weeklong Warrior',
      'Praise Pioneer',
    ],
    half: [
      'Halfway Hero',
      'Casual Crusader',
      'Part-Time Powerhouse',
      'Flexi Fan',
      'Wave Rider',
      'Sporadic Superstar',
    ],
  },
  yesterday: {
    full: ['Hustler', 'Ace of Likes', 'Heartquake', 'Ten-Tap Titan', 'Praise Patron'],
    half: [
      'Cherry Picker',
      'Selective Star',
      'Picky Praiser',
      'Like Connoisseur',
      'Appreciation Artist',
      'Selective Supporter',
    ],
  },
}
function randomizeTitle(period: 'lastWeek' | 'yesterday', status: DisplayedStatus) {
  const title = titles[period][status]
  return title[Math.min(Math.floor(Math.random() * title.length), title.length - 1)]
}

const contentMap: Record<
  'lastWeek' | 'yesterday',
  Record<DisplayedStatus, { title: string; subtitle: string }>
> = {
  lastWeek: {
    full: {
      title: randomizeTitle('lastWeek', 'full'),
      subtitle: 'You dominated last week, and maximized your rewards every day! Impressive!',
    },
    half: {
      title: randomizeTitle('lastWeek', 'half'),
      subtitle:
        "You had some good activity last week, but you still gave up some rewards. Let's see just a little more this week!",
    },
  },
  yesterday: {
    full: {
      title: randomizeTitle('yesterday', 'full'),
      subtitle:
        'Incredible work yesterday! You did 10 likes yesterday and went above and beyond. Your energy is unmatched!',
    },
    half: {
      title: randomizeTitle('yesterday', 'half'),
      subtitle:
        'Good effort yesterday, but you missed out on maximum rewards. Make sure to like at least 10 posts today!',
    },
  },
}

function InnerProgressModal() {
  const myAddress = useMyAddress() ?? ''
  const [visible, setVisible] = useState(false)
  const { data } = useFetchUserPrevReward(myAddress)
  const { loading: loadingProfile } = useFetchProfileSpace({ id: myAddress })
  const [hasAvatarLoaded, setHasAvatarLoaded] = useState(false)
  const [isWaitingAvatar, setIsWaitingAvatar] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsWaitingAvatar(false)
    }, 1_000)
  }, [])

  useEffect(() => {
    if (!data || loadingProfile) return
    if (data.rewardStatus === 'none') return

    setVisible(true)
  }, [data, loadingProfile])

  const isUsingLastWeekData = data?.period === 'WEEK'
  const status = data?.rewardStatus ?? 'half'

  if (status === 'none') {
    return null
  }

  return (
    <>
      <CustomModal
        visible={visible}
        onCancel={() => {
          setVisible(false)
          progressModalStorage.close()
        }}
        title={`Your progress ${isUsingLastWeekData ? 'last week' : 'yesterday'}`}
        closable
        className={clsx(styles.ProgressModal, statusClassName[status])}
        contentClassName={styles.Content}
      >
        <div id='progress-modal-content'>
          <ProgressPanel
            hasAvatarLoaded={hasAvatarLoaded}
            setHasAvatarLoaded={setHasAvatarLoaded}
            disableButtons={isWaitingAvatar && !hasAvatarLoaded}
          />
        </div>
        <div
          id='progress-image'
          className={clsx(styles.ProgressModal, statusClassName[status], 'position-relative')}
          style={{ width: '575px', display: 'none' }}
        >
          <div className='ant-modal-content p-5'>
            <img
              src='/images/creators/diamonds/diamond-top-left.svg'
              className={clsx(styles.OutsideDiamondLeft)}
            />
            <div style={{ maxWidth: '350px', margin: '0 auto' }}>
              <ProgressPanel forPostImage hasAvatarLoaded={hasAvatarLoaded} />
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  )
}

function ProgressPanel({
  forPostImage,
  hasAvatarLoaded,
  setHasAvatarLoaded,
  disableButtons,
}: {
  forPostImage?: boolean
  hasAvatarLoaded?: boolean
  setHasAvatarLoaded?: (hasAvatarLoaded: boolean) => void
  disableButtons?: boolean
}) {
  const { ipfs } = useSubsocialApi()

  const myAddress = useMyAddress() ?? ''
  const profile = useSelectProfile(myAddress)
  const isMobile = useIsMobileWidthOrDevice()

  const { data } = useFetchUserPrevReward(myAddress)

  const { defaultSpaceIdToPost } = useDefaultSpaceIdToPost()

  const { isSmallMobile } = useResponsiveSize()
  const [loading, setLoading] = useState(false)

  const isUsingLastWeekData = data?.period === 'WEEK'
  const status = data?.rewardStatus ?? 'half'

  if (status === 'none') {
    return null
  }

  const usedContent = contentMap[isUsingLastWeekData ? 'lastWeek' : 'yesterday'][status]

  const generateImage = async (onSuccess: (image: string) => void) => {
    const element = document.getElementById('progress-image')
    if (!element) return

    setLoading(true)
    const image = await html2canvas(element, {
      backgroundColor: status === 'full' ? '#7534A9' : '#F57F00',
      allowTaint: true,
      // only render the modal, especially only the progress-image div. this is good to avoid having broken image which html2canvas waits forever
      ignoreElements: element => element.id === '__next' || element.id === 'progress-modal-content',
      useCORS: true,
      scale: 2,
      onclone: doc => {
        doc.getElementById('progress-image')!.style.display = 'block'
      },
    })

    image.toBlob(async blob => {
      if (!blob) {
        setLoading(false)
        return
      }

      const compressedImage = await resizeImage(blob)
      let cid: string | undefined
      try {
        cid = await ipfs.saveFileToOffchain(compressedImage)
        if (!cid) throw new Error('Failed to save image to IPFS')

        progressModalStorage.close()
        onSuccess(resolveIpfsUrl(cid))
      } catch (err: any) {
        controlledMessage({
          message: 'Failed to generate reward image',
          description: err.message || undefined,
          type: 'error',
        })
        console.error(err)
      }
      setLoading(false)
    })
  }

  const shareOnPolkaverse = () => {
    const { isZero, value } = formatSUB(data?.earned)
    const title = `I earned ${isZero ? '' : `${value} `}SUB ${
      isUsingLastWeekData ? 'last week for my activity' : 'yesterday'
    } on Subsocial!`
    const desc = 'Being a part of The Creator Economy is great!'
    generateImage(image => {
      window.open(
        fullUrl(
          `${defaultSpaceIdToPost}/posts/new?image=${encodeURIComponent(
            image,
          )}&title=${encodeURIComponent(title)}&body=${encodeURIComponent(desc)}`,
        ),
        '_blank',
      )
    })
  }

  const shareOnX = () => {
    const { isZero, value } = formatSUB(data?.earned)
    generateImage(image => {
      openNewWindow(
        twitterShareUrl(
          fullUrl(`/leaderboard/${myAddress}?image=${encodeURIComponent(image)}`),
          `I earned ${isZero ? '' : `${value} `}#SUB ${
            isUsingLastWeekData ? 'last week for my activity' : 'yesterday'
          } on @SubsocialChain! 🥳\n\nFollow me here and join The Creator Economy!`,
        ),
      )
    })
  }

  const rewardContents: RewardContent[] = [
    {
      title: "Staker's rewards",
      content: (
        <FormatBalance
          withMutedDecimals={false}
          value={data?.earned}
          precision={2}
          currency='SUB'
          decimals={10}
        />
      ),
    },
    {
      title: "Creator's rewards",
      content: (
        <FormatBalance
          withMutedDecimals={false}
          value={data?.earned}
          precision={2}
          currency='SUB'
          decimals={10}
        />
      ),
    },
  ]

  return (
    <>
      {!forPostImage && <DiamondIcon className={styles.DiamondIcon} />}
      <div className={clsx(styles.ProgressModalContent)}>
        <div className={clsx('d-flex', isMobile ? 'GapSmall' : 'GapNormal')}>
          <div className='mt-2'>
            <Avatar
              noMargin
              size={isMobile ? 45 : 60}
              asLink={false}
              address={myAddress}
              avatar={hasAvatarLoaded || !forPostImage ? profile?.content?.image : undefined}
              onLoad={() => {
                if (!forPostImage) setHasAvatarLoaded?.(true)
              }}
            />
          </div>
          <div className='d-flex flex-column'>
            <span className='FontLarge FontWeightBold mb-1'>{usedContent.title}</span>
            <p className={clsx('mb-0', styles.MutedText)}>{usedContent.subtitle}</p>
          </div>
        </div>
        <div className='d-flex w-100 GapSmall'>
          <RewardCard forPostImage={forPostImage} contents={rewardContents} />
        </div>
      </div>
      {!forPostImage && (
        <div
          className='GapNormal mt-4'
          style={{
            display: 'grid',
            gridTemplateColumns: defaultSpaceIdToPost && !isSmallMobile ? '1fr 1fr' : '1fr',
          }}
        >
          <Button
            loading={loading}
            disabled={disableButtons}
            type='default'
            size='large'
            onClick={() => shareOnX()}
          >
            Share on X
          </Button>
          {defaultSpaceIdToPost && (
            <Button
              className={styles.GhostButton}
              disabled={disableButtons}
              type='default'
              ghost
              size='large'
              onClick={() => shareOnPolkaverse()}
              loading={loading}
            >
              Share on Polkaverse
            </Button>
          )}
        </div>
      )}
    </>
  )
}

type RewardContent = { title: string; content: ReactNode }
function RewardCard({
  contents,
  forPostImage,
}: {
  contents: RewardContent[]
  forPostImage?: boolean
}) {
  return (
    <div className={clsx(styles.RewardCard)}>
      <DfImage
        preview={false}
        src='/images/creators/diamonds/diamond.png'
        className={clsx(styles.Diamond, forPostImage && styles.DiamondRight)}
      />
      <div className={clsx('d-flex align-items-center w-100')}>
        {contents.map(({ title, content }) => (
          <div className={styles.RewardCardContent} style={{ flex: '1' }} key={title}>
            <span className={clsx('FontSmall', styles.MutedText)}>{title}</span>
            {/* If you use FontWeightSemibold forPostImage, it will cause the result of html2canvas has some strange letter spacing */}
            <span
              className={clsx(
                forPostImage ? 'FontLarge FontWeightBold' : 'FontLarge FontWeightSemibold',
              )}
            >
              {content}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatSUB(value: string | undefined) {
  try {
    if (!value) throw new Error('Value is not defined')

    const parsedValue = BigInt(value) / BigInt(10 ** 10)
    return { value: parsedValue.toString(), isZero: parsedValue <= 0 }
  } catch {
    return { value: '0', isZero: true }
  }
}
