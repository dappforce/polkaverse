import { Button, Tooltip } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { SlQuestion } from 'react-icons/sl'
import { ReactNode } from 'react-markdown'
import CustomModal from 'src/components/utils/CustomModal'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useFetchUserPrevReward } from 'src/rtk/features/activeStaking/hooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import Avatar from '../profiles/address-views/Avatar'
import { DfImage } from '../utils/DfImage'
import DiamondIcon from '../utils/icons/Diamond'
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

type Status = 'full' | 'half' | 'none'
const statusClassName: Record<Status, string> = {
  full: '',
  half: styles.Halfway,
  none: styles.NoProgress,
}

const contentMap: Record<
  'lastWeek' | 'yesterday',
  Record<Status, { title: string; subtitle: string }>
> = {
  lastWeek: {
    full: {
      title: 'Week Striker',
      subtitle: 'You dominated last week, and maximized your rewards every day! Impressive!',
    },
    half: {
      title: 'Halfway Hero',
      subtitle:
        "You had some good activity last week, but you still gave up some rewards. Let's see just a little more this week!",
    },
    none: { title: '', subtitle: '' },
  },
  yesterday: {
    full: {
      title: 'Hustler',
      subtitle:
        'Incredible work yesterday! You completed every task and went above and beyond. Your energy is unmatched!',
    },
    half: {
      title: 'Cherry Picker',
      subtitle:
        'Good effort yesterday, but you missed out on maximum rewards. Make sure to like at least 10 posts today!',
    },
    none: {
      title: 'Lurker',
      subtitle:
        "It looks like you had a quiet day yesterday. We miss you, and hope you'll start being more active!",
    },
  },
}

function InnerProgressModal() {
  const myAddress = useMyAddress() ?? ''
  const [visible, setVisible] = useState(false)
  const profile = useSelectProfile(myAddress)
  const { data } = useFetchUserPrevReward(myAddress)

  useEffect(() => {
    if (data) setVisible(true)
  }, [data])

  let status: Status = 'full'
  const superLikesCount = data?.likedPosts ?? 0
  if (superLikesCount === 0) {
    status = 'none'
  } else if (superLikesCount < 10) {
    status = 'half'
  }

  const isUsingLastWeekData = data?.period === 'WEEK'

  const usedContent = contentMap[isUsingLastWeekData ? 'lastWeek' : 'yesterday'][status]

  return (
    <CustomModal
      visible={visible}
      onCancel={() => {
        setVisible(false)
        progressModalStorage.close()
      }}
      title={`Your progress ${isUsingLastWeekData ? 'last week' : 'yesterday'}`}
      closable
    >
      <div className={clsx(styles.ProgressModal, statusClassName[status], 'mt-2')}>
        <DiamondIcon className={styles.DiamondIcon} />
        <div className='d-flex flex-column align-items-center'>
          <div className='mb-2'>
            <Avatar
              noMargin
              size={50}
              asLink={false}
              address={myAddress}
              avatar={profile?.content?.image}
            />
          </div>
          <span className='text-center FontLarge FontWeightBold'>{usedContent.title}</span>
          <p className='text-center ColorSlate mb-0'>{usedContent.subtitle}</p>
        </div>
        <div className='d-flex w-100 GapSmall'>
          <RewardCard
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
        </div>
      </div>
      <Button type='primary' size='large' className='mt-4'>
        Share on X!
      </Button>
    </CustomModal>
  )
}

function RewardCard({
  content,
  title,
  tooltip,
  withDiamond,
}: {
  withDiamond?: boolean
  title: string
  tooltip?: string
  content: ReactNode
}) {
  return (
    <div className={styles.RewardCard}>
      {withDiamond && (
        <DfImage preview={false} src='/images/diamond.png' className={styles.Diamond} />
      )}
      <div className='d-flex align-items-center GapTiny ColorSlate'>
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
