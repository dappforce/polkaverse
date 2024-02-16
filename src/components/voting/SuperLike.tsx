import { stringToHex } from '@polkadot/util'
import { signatureVerify } from '@polkadot/util-crypto'
import { PostStruct } from '@subsocial/api/types'
import { Button, ButtonProps, Image, Tooltip } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { ComponentProps, useEffect, useState } from 'react'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useAppDispatch } from 'src/rtk/app/store'
import {
  fetchAddressLikeCounts,
  setAddressLikeCount,
} from 'src/rtk/features/activeStaking/addressLikeCountSlice'
import {
  useCanPostSuperLiked,
  useFetchSuperLikeMessage,
  useFetchUserRewardReport,
  useHasISuperLikedPost,
  useSuperLikeCount,
} from 'src/rtk/features/activeStaking/hooks'
import {
  fetchRewardReport,
  setOptimisticRewardReportChange,
} from 'src/rtk/features/activeStaking/rewardReportSlice'
import {
  fetchSuperLikeCounts,
  setSuperLikeCount,
} from 'src/rtk/features/activeStaking/superLikeCountsSlice'
import { fetchSuperLikeMessage } from 'src/rtk/features/activeStaking/superLikeMessageSlice'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getAmountRange } from 'src/utils/analytics'
import { getSubIdCreatorsLink } from 'src/utils/links'
import { useAuth } from '../auth/AuthContext'
import { useMyAddress } from '../auth/MyAccountsContext'
import { useGetCurrentSigner } from '../auth/utils'
import { IconWithLabel } from '../utils'
import CustomModal from '../utils/CustomModal'
import { createSuperLike } from '../utils/datahub/active-staking'
import { useAmISpaceFollower } from '../utils/FollowSpaceButton'
import { showErrorMessage } from '../utils/Message'
import styles from './SuperLike.module.sass'

export type SuperLikeProps = ButtonProps & {
  post: PostStruct
  iconClassName?: string
  isComment?: boolean
}

const CURRENT_WEEK_SIG = 'df.current-week-sig'

export default function SuperLike({ post, iconClassName, isComment, ...props }: SuperLikeProps) {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const sendEvent = useSendEvent()
  const getSigner = useGetCurrentSigner()
  const [isSigning, setIsSigning] = useState(false)

  const { data: superLikeMessage } = useFetchSuperLikeMessage()

  const clientCanPostSuperLiked = useClientValidationOfPostSuperLike(post.createdAtTime)
  const spaceId = post.spaceId
  const amIFollower = useAmISpaceFollower(spaceId)

  const { isExist, canPostSuperLiked, validByCreatorMinStake } = useCanPostSuperLiked(post.id)

  const [isOpenShouldStakeModal, setIsOpenShouldStakeModal] = useState(false)
  const [isOpenActiveStakingModal, setIsOpenActiveStakingModal] = useState(false)

  const { data: totalStake, loading: loadingTotalStake } = useFetchTotalStake(myAddress ?? '')
  const { data: userReport } = useFetchUserRewardReport()
  const count = useSuperLikeCount(post.id)
  const hasILiked = useHasISuperLikedPost(post.id)

  const isMyPost = post.ownerId === myAddress

  const isActive = hasILiked
  const canBeSuperliked = clientCanPostSuperLiked && canPostSuperLiked
  const isDisabled = !canBeSuperliked || isMyPost || loadingTotalStake || !superLikeMessage.message

  const { openSignInModal } = useAuth()

  const onClick = async () => {
    if (isActive || isDisabled) return

    if (!myAddress) {
      openSignInModal()
      return
    }
    if (!totalStake?.hasStakedEnough) {
      setIsOpenShouldStakeModal(true)
      return
    }

    const signature = localStorage.getItem(CURRENT_WEEK_SIG)
    if (!signature) {
      setIsOpenActiveStakingModal(true)
      return
    } else {
      const message = superLikeMessage.message
      const result = signatureVerify(message, signature, myAddress)
      if (!result.isValid) {
        localStorage.removeItem(CURRENT_WEEK_SIG)
        setIsOpenActiveStakingModal(true)
        dispatch(fetchSuperLikeMessage({ reload: true }))
        return
      }
    }

    sendEvent('like', {
      postId: post.id,
      value: (userReport?.superLikesCount ?? 0) + 1,
      spaceId,
      isFollower: amIFollower,
      isComment,
      amountRange: getAmountRange(totalStake.amount),
    })

    try {
      // set optimistic changes
      dispatch(setSuperLikeCount({ postId: post.id, count: count + 1 }))
      dispatch(setAddressLikeCount({ address: myAddress, postId: post.id, count: 1 }))
      dispatch(setOptimisticRewardReportChange({ address: myAddress, superLikeCountChange: 1 }))

      await createSuperLike({
        address: myAddress,
        args: { postId: post.id, confirmation: { msg: superLikeMessage.message, sig: signature } },
      })
    } catch (error) {
      // undo the optimistic changes
      dispatch(setSuperLikeCount({ postId: post.id, count }))
      dispatch(setAddressLikeCount({ address: myAddress, postId: post.id, count: 0 }))
      dispatch(setOptimisticRewardReportChange({ address: myAddress, superLikeCountChange: -1 }))

      // refetch the real data
      dispatch(fetchSuperLikeCounts({ postIds: [post.id], reload: true }))
      dispatch(fetchAddressLikeCounts({ address: myAddress, postIds: [post.id], reload: true }))
      dispatch(fetchRewardReport({ address: myAddress, reload: true }))
    }
  }

  const icon = (
    <Diamond
      className={clsx('FontNormal', iconClassName)}
      style={{ position: 'relative', top: '0.05em' }}
      isFilled={isActive}
    />
  )

  const entity = isComment ? 'comment' : 'post'

  let tooltipTitle = ''
  if (isMyPost) tooltipTitle = `You cannot like your own ${entity}`
  else if (!isExist)
    tooltipTitle = `This ${entity} is still being minted, please wait a few seconds`
  else if (!validByCreatorMinStake)
    tooltipTitle = `This ${entity} cannot be liked because its author has not yet locked at least 2,000 SUB`
  else if (!canBeSuperliked) tooltipTitle = `You cannot like ${entity}s that are older than 7 days`
  else if (!superLikeMessage.message) tooltipTitle = 'Loading...'

  const button = (
    <div>
      <Button
        className={clsx(
          'FontSmall',
          styles.SuperLike,
          isActive && styles.SuperLikeActive,
          props.className,
        )}
        onClick={onClick}
        disabled={isDisabled}
      >
        <IconWithLabel renderZeroCount icon={icon} count={count} />
      </Button>
    </div>
  )

  return (
    <>
      {tooltipTitle ? <Tooltip title={tooltipTitle}>{button}</Tooltip> : button}
      <ShouldStakeModal
        visible={isOpenShouldStakeModal}
        onCancel={() => setIsOpenShouldStakeModal(false)}
      />
      <CustomModal
        visible={isOpenActiveStakingModal}
        destroyOnClose
        onCancel={() => setIsOpenActiveStakingModal(false)}
        title='Join the Content Staking Program!'
        subtitle='By confirming, you agree to participate in the Content Staking Program, where you may get SUB tokens, NFTs, or other tokens, based on your active engagement.'
      >
        <div className='d-flex flex-column align-items-center GapLarge'>
          <Image
            src='/images/creators/subsocial-tokens-large.png'
            className='w-100'
            style={{ maxWidth: '250px' }}
            preview={{ mask: false }}
          />
          <Button
            block
            type='primary'
            size='large'
            loading={isSigning}
            onClick={async () => {
              setIsSigning(true)
              try {
                const signer = await getSigner()
                if (signer && myAddress) {
                  const message = superLikeMessage.message
                  const signature = await signer.signRaw?.({
                    address: myAddress,
                    data: stringToHex(message),
                    type: 'bytes',
                  })
                  localStorage.setItem(CURRENT_WEEK_SIG, signature?.signature.toString() ?? '')
                  onClick()
                }
              } catch (err) {
                showErrorMessage({
                  message: 'Failed to sign the message',
                  description: 'Please relogin to your account to continue',
                })
              } finally {
                setIsSigning(false)
                setIsOpenActiveStakingModal(false)
              }
            }}
          >
            Confirm
          </Button>
        </div>
      </CustomModal>
    </>
  )
}

function Diamond({ isFilled, ...props }: ComponentProps<'svg'> & { isFilled?: boolean }) {
  return (
    <svg
      {...props}
      width='1em'
      height='1em'
      viewBox='0 0 12 12'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g id='diamond-2 1' clipPath='url(#clip0_922_11679)'>
        <g id='Group'>
          {isFilled ? (
            <>
              <path
                d='M7.97217 3.13373L7.00062 0.202148H4.9931L4.02734 3.13373H7.97217Z'
                fill='white'
              />
              <path
                d='M2.14982 0.202148L0 3.13373H3.25522L4.22094 0.202148H2.14982Z'
                fill='white'
              />
              <path
                d='M11.9993 3.13373L9.84944 0.202148H7.77148L8.74303 3.13373H11.9993Z'
                fill='white'
              />
              <path d='M8.91918 3.86658L7.12305 10.3089L11.9978 3.86658H8.91918Z' fill='white' />
              <path d='M5.99976 11.7978L8.13786 3.88062H3.83203L5.99976 11.7978Z' fill='white' />
              <path
                d='M0.00390625 3.86658L4.85115 10.2737L3.08155 3.86658H0.00390625Z'
                fill='white'
              />
            </>
          ) : (
            <path
              id='Vector'
              d='M9.68407 0.450073C9.30223 0.450073 2.73753 0.450073 2.31661 0.450073L0 3.60907L6.02489 11.5498L12 3.60816L9.68407 0.450073ZM3.2937 3.95613L4.99115 9.0273L1.14349 3.95613H3.2937ZM4.03317 3.95613H7.96958L6.01489 9.87661L4.03317 3.95613ZM8.70805 3.95613H10.8607L7.02475 9.05456L8.70805 3.95613ZM9.32869 1.15128L10.8714 3.25491H8.70852L8.01827 1.15128H9.32869ZM7.28027 1.15128L7.97052 3.25491H4.03014L4.72038 1.15128H7.28027ZM2.67194 1.15128H3.98236L3.29211 3.25491H1.12928L2.67194 1.15128Z'
              fill='currentColor'
            />
          )}
        </g>
      </g>
      <defs>
        <clipPath id='clip0_922_11679'>
          <rect width='12' height='12' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

function ShouldStakeModal({ onCancel, visible }: { visible: boolean; onCancel: () => void }) {
  return (
    <CustomModal
      visible={visible}
      onCancel={onCancel}
      title='Wait a sec...'
      subtitle='In this app, every like is more than just a thumbs-up! When you like a post, both you and the author can earn extra SUB tokens. For this, you need to start locking SUB tokens first.'
    >
      <div className='d-flex flex-column align-items-center GapLarge'>
        <Image
          src='/images/creators/subsocial-tokens-large.png'
          className='w-100'
          style={{ maxWidth: '250px' }}
          preview={{ mask: null }}
        />
        <Button block type='primary' size='large' href={getSubIdCreatorsLink()} target='_blank'>
          Start Locking SUB
        </Button>
      </div>
    </CustomModal>
  )
}

function useClientValidationOfPostSuperLike(createdAtTime: number) {
  const [, setState] = useState({})

  useEffect(() => {
    const interval = setInterval(() => setState({}), 5 * 1000 * 60) // refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const isPostMadeMoreThan1WeekAgo = dayjs().diff(dayjs(createdAtTime), 'day') > 7
  return !isPostMadeMoreThan1WeekAgo
}
