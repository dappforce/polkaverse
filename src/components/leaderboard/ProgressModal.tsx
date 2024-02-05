import { Button, Tooltip } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import html2canvas from 'html2canvas'
import { useEffect, useState } from 'react'
import { SlQuestion } from 'react-icons/sl'
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
import { useResponsiveSize } from '../responsive'
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
    setShouldShowModal(!progressModalStorage.getIsClosed() && !!myAddress)
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
        'Incredible work yesterday! You completed every task and went above and beyond. Your energy is unmatched!',
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
        <ProgressPanel />
        <div
          id='progress-image'
          className={clsx(styles.ProgressModal, statusClassName[status], 'position-relative')}
          style={{ width: '600px', display: 'none' }}
        >
          <div className='ant-modal-content p-3 pb-4'>
            <img
              src='/images/creators/diamonds/blurred-diamond-right.png'
              className={clsx(styles.OutsideDiamondRight)}
            />
            <img
              src='/images/creators/diamonds/blurred-diamond-top-left.png'
              className={clsx(styles.OutsideDiamondLeft)}
            />
            <div style={{ maxWidth: '350px', margin: '0 auto' }}>
              <ProgressPanel forPostImage />
            </div>
          </div>
        </div>
      </CustomModal>
    </>
  )
}

function ProgressPanel({ forPostImage }: { forPostImage?: boolean }) {
  const { ipfs } = useSubsocialApi()

  const myAddress = useMyAddress() ?? ''
  const profile = useSelectProfile(myAddress)

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

  let hasMissedReward = false
  try {
    hasMissedReward = BigInt(data?.missedReward || '0') > 0
  } catch {}

  const handle = profile?.struct.handle
  const spaceHandleOrId = (handle && `@${handle}`) || profile?.id

  const generateImage = async (onSuccess: (image: string) => void) => {
    const element = document.getElementById('progress-image')
    if (!element) return

    setLoading(true)
    const image = await html2canvas(element, {
      backgroundColor: status === 'full' ? '#7534A9' : '#F57F00',
      allowTaint: true,
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
    openNewWindow(
      twitterShareUrl(
        spaceHandleOrId ? `/${spaceHandleOrId}` : `/accounts/${myAddress}`,
        `I earned ${isZero ? '' : `${value} `}#SUB ${
          isUsingLastWeekData ? 'last week for my activity' : 'yesterday'
        } on @SubsocialChain! 🥳\n\nFollow me here and join The Creator Economy!`,
      ),
    )
  }

  return (
    <>
      {!forPostImage && <DiamondIcon className={styles.DiamondIcon} />}
      <div className={clsx(styles.ProgressModalContent, 'mt-2')}>
        <div className='d-flex flex-column align-items-center'>
          <div className='mb-2'>
            <Avatar
              noMargin
              size={60}
              asLink={false}
              address={myAddress}
              avatar={profile?.content?.image}
            />
          </div>
          <span className='text-center FontLarge FontWeightBold mb-2'>{usedContent.title}</span>
          <p className='text-center mb-0'>{usedContent.subtitle}</p>
        </div>
        <div className='d-flex w-100 GapSmall'>
          <RewardCard
            forPostImage={forPostImage}
            aligment={hasMissedReward ? 'left' : 'center'}
            title={`${isUsingLastWeekData ? 'Last week' : 'Yesterday'}'s reward`}
            content={
              <FormatBalance
                withMutedDecimals={false}
                value={data?.earned}
                precision={2}
                currency='SUB'
                decimals={10}
              />
            }
            withDiamond
          />
          {hasMissedReward && (
            <RewardCard
              forPostImage={forPostImage}
              aligment='left'
              title='Missed rewards'
              tooltip='How many SUB you could have received by liking at least 10 posts yesterday'
              content={
                <FormatBalance
                  withMutedDecimals={false}
                  value={data?.missedReward}
                  precision={2}
                  currency='SUB'
                  decimals={10}
                />
              }
            />
          )}
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
          <Button type='default' size='large' onClick={() => shareOnX()}>
            Share on X
          </Button>
          {defaultSpaceIdToPost && (
            <Button
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

function RewardCard({
  content,
  title,
  tooltip,
  withDiamond,
  aligment,
  forPostImage,
}: {
  aligment: 'center' | 'left'
  withDiamond?: boolean
  title: string
  tooltip?: string
  content: ReactNode
  forPostImage?: boolean
}) {
  return (
    <div
      className={clsx(
        styles.RewardCard,
        aligment === 'center' ? 'align-items-center' : 'align-items-start',
      )}
    >
      {withDiamond && (
        <DfImage
          preview={false}
          src='/images/creators/diamonds/diamond.png'
          className={clsx(styles.Diamond, forPostImage && styles.DiamondRight)}
        />
      )}
      <div className={clsx('d-flex GapTiny align-items-center')}>
        <span className='FontSmall'>{title}</span>
        {tooltip && (
          <Tooltip title={tooltip}>
            <SlQuestion className='FontTiny' />
          </Tooltip>
        )}
      </div>
      <span className={clsx('FontWeightSemibold', forPostImage ? 'FontBig' : 'FontLarge')}>
        {content}
      </span>
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
