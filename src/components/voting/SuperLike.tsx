import { PostStruct } from '@subsocial/api/types'
import { Button, ButtonProps, Image } from 'antd'
import clsx from 'clsx'
import { CSSProperties, useState } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { useSuperLikeCount } from 'src/rtk/features/activeStaking/hooks'
import { useOpenCloseOnBoardingModal } from 'src/rtk/features/onBoarding/onBoardingHooks'
import { useAuth } from '../auth/AuthContext'
import { useMyAddress } from '../auth/MyAccountsContext'
import { IconWithLabel } from '../utils'
import CustomModal from '../utils/CustomModal'
import { createSuperLike } from '../utils/datahub/super-likes'

export type SuperLikeProps = ButtonProps & {
  post: PostStruct
}

const FIRST_TIME_SUPERLIKE = 'df.first-time-superlike'

export default function SuperLike({ post, ...props }: SuperLikeProps) {
  const [isOpenActiveStakingModal, setIsOpenActiveStakingModal] = useState(false)
  const count = useSuperLikeCount(post.id)
  const isActive = true

  const openOnBoardingModal = useOpenCloseOnBoardingModal()
  const myAddress = useMyAddress()

  const {
    openSignInModal,
    state: {
      completedSteps: { hasTokens },
    },
  } = useAuth()

  const onClick = async () => {
    if (!myAddress) {
      openSignInModal()
      return
    }
    if (!hasTokens) {
      openOnBoardingModal('open', { type: 'partial', toStep: 'energy' })
      return
    }

    await createSuperLike({ address: myAddress, args: { postId: post.id } })
    if (localStorage.getItem(FIRST_TIME_SUPERLIKE) !== 'false') {
      setIsOpenActiveStakingModal(true)
    }
    localStorage.setItem(FIRST_TIME_SUPERLIKE, 'false')
  }

  const likeStyle: CSSProperties = { position: 'relative', top: '0.07em' }
  const icon = isActive ? (
    <AiFillHeart className='FontSemilarge ColorPrimary' style={likeStyle} />
  ) : (
    <AiOutlineHeart className='FontSemilarge' style={likeStyle} />
  )
  return (
    <>
      <Button
        className={clsx('DfVoterButton ColorMuted', isActive && 'ColorPrimary', props.className)}
        onClick={onClick}
      >
        <IconWithLabel icon={icon} count={count} />
      </Button>
      <CustomModal
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
      </CustomModal>
    </>
  )
}
