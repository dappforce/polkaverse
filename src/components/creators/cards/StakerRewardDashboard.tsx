import { Progress, Skeleton } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { SlQuestion } from 'react-icons/sl'
import { DfImage } from 'src/components/utils/DfImage'
import { MutedSpan } from 'src/components/utils/MutedText'
import { Pluralize } from 'src/components/utils/Plularize'
import Segment from 'src/components/utils/Segment'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import styles from './StakerRewardDashboard.module.sass'

const LIKES_FOR_MAX_REWARDS = 10
const DISTRIBUTION_DAY = 0
export default function StakerRewardDashboard() {
  const { data, loading } = useFetchUserRewardReport()

  const likeCount = data?.superLikesCount ?? 0
  const isMoreThanMax = likeCount > LIKES_FOR_MAX_REWARDS
  const surplusLike = isMoreThanMax ? likeCount - LIKES_FOR_MAX_REWARDS : 0

  const todayReward = data?.currentRewardAmount ?? 0
  const weekReward = data?.weeklyReward ?? 0 + todayReward
  const dayLeftUntilDistribution = DISTRIBUTION_DAY + 7 - new Date().getDay()

  let progress = (likeCount / LIKES_FOR_MAX_REWARDS) * 100
  let strokeColor = '#D232CF'
  if (progress >= 100) {
    strokeColor = '#32D255'
  }

  return (
    <Segment className={clsx(styles.StakerRewardDashboard)}>
      <div className={styles.TopSection}>
        <p className={clsx(styles.Title, 'mb-0')}>Creator Staking</p>
        <Link href='https://docs.subsocial.network/docs/basics/creator-staking' passHref>
          <a target='_blank' className={styles.Link}>
            How does it work?
          </a>
        </Link>
        <DfImage src='/images/diamond.svg' className={styles.Image} />
      </div>
      <div className={clsx(styles.BottomSection)}>
        <div className={styles.Goal}>
          <div className={styles.GoalInfo}>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Goal achieved</MutedSpan>
              {/* TODO: add tooltip */}
              <SlQuestion className='FontTiny ColorMuted' />
            </div>
            <span className='FontWeightSemibold d-flex align-items-center'>
              {loading ? <NumberSkeleton /> : <span>{likeCount}</span>}
              <MutedSpan>/10</MutedSpan>
              {!!surplusLike && <span> +{surplusLike}</span>}
            </span>
          </div>
          <div
            className={styles.Progress}
            style={{
              gridTemplateColumns: progress <= 100 ? '1fr' : `1fr ${(progress - 100) / 100}fr`,
            }}
          >
            {loading ? (
              <Skeleton.Input
                style={{ height: '1em', width: '100%', marginTop: '6px', borderRadius: '20px' }}
              />
            ) : (
              <>
                <Progress
                  showInfo={false}
                  percent={progress > 100 ? 100 : progress}
                  strokeColor={strokeColor}
                  trailColor='#CBD5E1'
                />
                {progress > 100 && (
                  <Progress
                    showInfo={false}
                    percent={100}
                    strokeColor='#5089F8'
                    trailColor='#CBD5E1'
                  />
                )}
              </>
            )}
          </div>
        </div>
        <div className='d-flex flex-column GapTiny mt-2'>
          <div className='d-flex justify-content-between'>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Approx. today</MutedSpan>
              {/* TODO: add tooltip */}
              <SlQuestion className='FontTiny ColorMuted' />
            </div>
            <span className='FontWeightSemibold d-flex align-items-center GapMini'>
              {loading ? <NumberSkeleton /> : <span>≈{todayReward} </span>}
              SUB
            </span>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Approx. this week</MutedSpan>
              {/* TODO: add tooltip */}
              <SlQuestion className='FontTiny ColorMuted' />
            </div>
            <span className='FontWeightSemibold d-flex align-items-center GapMini'>
              {loading ? <NumberSkeleton /> : <span>≈{weekReward} </span>} SUB
            </span>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='d-flex align-items-baseline GapMini'>
              <MutedSpan>Distribution in</MutedSpan>
              {/* TODO: add tooltip */}
              <SlQuestion className='FontTiny ColorMuted' />
            </div>
            <span className='FontWeightSemibold'>
              <Pluralize count={dayLeftUntilDistribution} singularText='day' pluralText='days' />
            </span>
          </div>
        </div>
      </div>
    </Segment>
  )
}

function NumberSkeleton() {
  return (
    <Skeleton.Input
      style={{
        height: '1em',
        width: '3ch',
        marginRight: '4px',
        borderRadius: '20px',
        position: 'relative',
        top: '1px',
      }}
    />
  )
}
