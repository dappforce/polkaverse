import { PostStruct } from '@subsocial/api/types'
import { Button, ButtonProps } from 'antd'
import clsx from 'clsx'
import { CSSProperties } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { useSuperLikeCount } from 'src/rtk/features/activeStaking/superLikeCountsHooks'
import { useOpenCloseOnBoardingModal } from 'src/rtk/features/onBoarding/onBoardingHooks'
import { useAuth } from '../auth/AuthContext'
import { useMyAddress } from '../auth/MyAccountsContext'
import { IconWithLabel } from '../utils'
import { createSuperLike } from '../utils/datahub/super-likes'

export type SuperLikeProps = ButtonProps & {
  post: PostStruct
}

export default function SuperLike({ post, ...props }: SuperLikeProps) {
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
  }

  const likeStyle: CSSProperties = { position: 'relative', top: '0.07em' }
  const icon = isActive ? (
    <AiFillHeart className='FontSemilarge ColorPrimary' style={likeStyle} />
  ) : (
    <AiOutlineHeart className='FontSemilarge' style={likeStyle} />
  )
  return (
    <Button
      className={clsx('DfVoterButton ColorMuted', isActive && 'ColorPrimary', props.className)}
      onClick={onClick}
    >
      <IconWithLabel icon={icon} count={count} />
    </Button>
  )
}
