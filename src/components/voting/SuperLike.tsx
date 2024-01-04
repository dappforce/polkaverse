import { PostStruct } from '@subsocial/api/types'
import { Button, ButtonProps, Image } from 'antd'
import clsx from 'clsx'
import { CSSProperties, useEffect, useState } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchAddressLikeCountSlice } from 'src/rtk/features/activeStaking/addressLikeCountSlice'
import { useHasISuperLikedPost, useSuperLikeCount } from 'src/rtk/features/activeStaking/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getSubIdCreatorsLink } from 'src/utils/links'
import { useAuth } from '../auth/AuthContext'
import { useMyAddress } from '../auth/MyAccountsContext'
import { IconWithLabel } from '../utils'
import CustomModal from '../utils/CustomModal'
import { createSuperLike } from '../utils/datahub/super-likes'

export type SuperLikeProps = ButtonProps & {
  post: PostStruct
}

// const FIRST_TIME_SUPERLIKE = 'df.first-time-superlike'

export default function SuperLike({ post, ...props }: SuperLikeProps) {
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()

  const [isOpenShouldStakeModal, setIsOpenShouldStakeModal] = useState(false)
  // const [isOpenActiveStakingModal, setIsOpenActiveStakingModal] = useState(false)

  const { data: totalStake, loading: loadingTotalStake } = useFetchTotalStake(myAddress ?? '')
  const count = useSuperLikeCount(post.id)
  const hasILiked = useHasISuperLikedPost(post.id)

  const [optimisticCount, setOptimisticCount] = useState(count)
  useEffect(() => {
    setOptimisticCount(count)
  }, [count])

  const [hasILikedOptimistic, setHasILikedOptimistic] = useState(hasILiked)
  useEffect(() => {
    setHasILikedOptimistic(hasILiked)
  }, [hasILiked])

  const isActive = hasILikedOptimistic

  const { openSignInModal } = useAuth()

  const onClick = async () => {
    if (!myAddress) {
      openSignInModal()
      return
    }
    if (!totalStake?.hasStaked) {
      setIsOpenShouldStakeModal(true)
      return
    }

    try {
      setOptimisticCount(count => count + 1)
      setHasILikedOptimistic(true)
      await createSuperLike({ address: myAddress, args: { postId: post.id } })
    } catch (error) {
      setOptimisticCount(count)
      setHasILikedOptimistic(hasILiked)
      dispatch(fetchAddressLikeCountSlice({ address: myAddress, postIds: [post.id], reload: true }))
    }

    // if (localStorage.getItem(FIRST_TIME_SUPERLIKE) !== 'false') {
    //   setIsOpenActiveStakingModal(true)
    // }
    // localStorage.setItem(FIRST_TIME_SUPERLIKE, 'false')
  }

  const likeStyle: CSSProperties = { position: 'relative', top: '0.04em' }
  const icon = isActive ? (
    <AiFillHeart className='FontLarge ColorPrimary' style={likeStyle} />
  ) : (
    <AiOutlineHeart className='FontLarge' style={likeStyle} />
  )
  return (
    <>
      <Button
        className={clsx('DfVoterButton ColorMuted', isActive && 'ColorPrimary', props.className)}
        style={{ background: 'transparent' }}
        disabled={isActive || loadingTotalStake}
        onClick={onClick}
      >
        <IconWithLabel renderTextIfEmpty icon={icon} count={optimisticCount} />
      </Button>
      <ShouldStakeModal
        visible={isOpenShouldStakeModal}
        onCancel={() => setIsOpenShouldStakeModal(false)}
      />
      {/* <CustomModal
        visible={isOpenActiveStakingModal}
        destroyOnClose
        onCancel={() => setIsOpenActiveStakingModal(false)}
        title='Join the Active Staking Program!'
        subtitle='By confirming, you agree to participate in the Active Staking Program, where you may get SUB tokens, NFTs, or other tokens, based on your active engagement.'
      >
        <div className='d-flex flex-column align-items-center GapLarge'>
          <Image
            src='/images/creators/subsocial-tokens-large.png'
            className='w-100'
            style={{ maxWidth: '250px' }}
            preview={{ mask: null }}
          />
          <Button
            block
            type='primary'
            size='large'
            onClick={() => setIsOpenActiveStakingModal(false)}
          >
            Confirm
          </Button>
        </div>
      </CustomModal> */}
    </>
  )
}

function ShouldStakeModal({ onCancel, visible }: { visible: boolean; onCancel: () => void }) {
  return (
    <CustomModal
      visible={visible}
      onCancel={onCancel}
      title='Wait a sec...'
      subtitle='In this app, every like is more than just a thumbs-up! When you like a post, both you and the author can earn extra SUB tokens. For this, you need to start staking SUB tokens first.'
    >
      <div className='d-flex flex-column align-items-center GapLarge'>
        <Image
          src='/images/creators/subsocial-tokens-large.png'
          className='w-100'
          style={{ maxWidth: '250px' }}
          preview={{ mask: null }}
        />
        <Button block type='primary' size='large' href={getSubIdCreatorsLink()} target='_blank'>
          Start Staking SUB
        </Button>
      </div>
    </CustomModal>
  )
}
