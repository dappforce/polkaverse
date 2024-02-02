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

const contentMap: Record<
  'lastWeek' | 'yesterday',
  Record<
    DisplayedStatus,
    { title: string; subtitle: (withFirstPersonPerspective?: boolean) => string }
  >
> = {
  lastWeek: {
    full: {
      title: 'Week Striker',
      subtitle: firstPerson =>
        `${firstPerson ? 'I' : 'You'} dominated last week, and maximized ${
          firstPerson ? 'my' : 'your'
        } rewards every day! Impressive!`,
    },
    half: {
      title: 'Halfway Hero',
      subtitle: firstPerson =>
        `${firstPerson ? 'I' : 'You'} had some good activity last week, but ${
          firstPerson ? 'I' : 'you'
        } still gave up some rewards. Let's see just a little more this week!`,
    },
  },
  yesterday: {
    full: {
      title: 'Hustler',
      subtitle: firstPerson =>
        `Incredible work yesterday! ${
          firstPerson ? 'I' : 'You'
        } completed every task and went above and beyond. ${
          firstPerson ? 'My' : 'Your'
        } energy is unmatched!`,
    },
    half: {
      title: 'Cherry Picker',
      subtitle: firstPerson =>
        `Good effort yesterday, but ${
          firstPerson ? 'I' : 'You'
        } missed out on maximum rewards. Make sure to like at least 10 posts today!`,
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
        <ProgressPanel withButtons />
        <div
          id='progress-image'
          className={clsx(styles.ProgressModal, statusClassName[status])}
          style={{ width: '400px', display: 'none' }}
        >
          <div className='ant-modal-content p-3 pb-4'>
            <ProgressPanel withFirstPersonPerspective />
          </div>
        </div>
      </CustomModal>
    </>
  )
}

function ProgressPanel({
  withButtons,
  withFirstPersonPerspective,
}: {
  withButtons?: boolean
  withFirstPersonPerspective?: boolean
}) {
  const { ipfs } = useSubsocialApi()

  const myAddress = useMyAddress() ?? ''
  const profile = useSelectProfile(myAddress)

  const { data } = useFetchUserPrevReward(myAddress)

  const { defaultSpaceIdToPost } = useDefaultSpaceIdToPost()

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

  const spaceHandleOrId = profile?.struct.handle || profile?.id

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
    generateImage(image => {
      window.open(
        fullUrl(`${defaultSpaceIdToPost}/posts/new?image=${encodeURIComponent(image)}`),
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
      <DiamondIcon className={styles.DiamondIcon} />
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
          <p className='text-center ColorSlate mb-0'>
            {usedContent.subtitle(withFirstPersonPerspective)}
          </p>
        </div>
        <div className='d-flex w-100 GapSmall'>
          <RewardCard
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
      {withButtons && (
        <div
          className='GapNormal mt-4'
          style={{ display: 'grid', gridTemplateColumns: defaultSpaceIdToPost ? '1fr 1fr' : '1fr' }}
        >
          <Button type='default' size='large' loading={loading} onClick={() => shareOnX()}>
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
}: {
  aligment: 'center' | 'left'
  withDiamond?: boolean
  title: string
  tooltip?: string
  content: ReactNode
}) {
  return (
    <div
      className={clsx(
        styles.RewardCard,
        aligment === 'center' ? 'align-items-center' : 'align-items-start',
      )}
    >
      {withDiamond && (
        <DfImage preview={false} src='/images/diamond.png' className={styles.Diamond} />
      )}
      <div className={clsx('d-flex GapTiny ColorSlate align-items-center')}>
        <span className='FontSmall'>{title}</span>
        {tooltip && (
          <Tooltip title={tooltip}>
            <SlQuestion className='FontTiny' />
          </Tooltip>
        )}
      </div>
      <span className='FontWeightSemibold FontLarge'>{content}</span>
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
