import { notDef } from '@subsocial/utils'
import { shallowEqual } from 'react-redux'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { useCreateReloadSpace } from 'src/rtk/app/hooks'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { selectSpaceIdsByFollower } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import { SpaceId, SpaceStruct } from 'src/types'
import { isHidden } from '.'
import { useMyAddress } from '../auth/MyAccountsContext'
import { reloadSpaceIdsFollowedByAccount } from '../spaces/helpers/reloadSpaceIdsFollowedByAccount'
import { BaseTxButtonProps } from '../substrate/SubstrateTxButton'
import { FollowButtonStub } from './FollowButtonStub'
import TxButton from './TxButton'

type FollowSpaceButtonProps = BaseTxButtonProps & {
  space: SpaceStruct
  withUnfollowButton?: boolean
}

type InnerFollowSpaceButtonProps = FollowSpaceButtonProps & {
  myAddress: string
}

export function FollowSpaceButton(props: FollowSpaceButtonProps) {
  const myAddress = useMyAddress()

  if (!myAddress) return <FollowButtonStub />

  return <InnerFollowSpaceButton {...props} myAddress={myAddress} />
}

export const useAmISpaceFollower = (spaceId: SpaceId = '0') => {
  const myAddress = useMyAddress()

  const followedSpaceIds =
    useAppSelector(
      state => (myAddress ? selectSpaceIdsByFollower(state, myAddress) : []),
      shallowEqual,
    ) || []

  return followedSpaceIds.indexOf(spaceId) >= 0
}

export function InnerFollowSpaceButton(props: InnerFollowSpaceButtonProps) {
  const { space, myAddress, withUnfollowButton = true, ...otherProps } = props
  const spaceId = space.id

  const isFollower = useAmISpaceFollower(spaceId)

  const reloadSpace = useCreateReloadSpace()
  const dispatch = useAppDispatch()
  const { substrate } = useSubsocialApi()

  const onTxSuccess = () => {
    // TODO think maybe it's better to check a single fullow: my account + this space?
    reloadSpaceIdsFollowedByAccount({ substrate, dispatch, account: myAddress })
    reloadSpace({ id: spaceId })
  }

  const buildTxParams = () => [spaceId]

  const loading = notDef(isFollower)

  const label = isFollower ? 'Unfollow' : 'Follow'

  if (!withUnfollowButton && isFollower) {
    return null
  }

  return (
    <TxButton
      type={isFollower ? 'default' : 'primary'}
      loading={loading}
      disabled={isHidden(space)}
      ghost={!isFollower}
      label={loading ? undefined : label}
      tx={isFollower ? 'spaceFollows.unfollowSpace' : 'spaceFollows.followSpace'}
      params={buildTxParams}
      onSuccess={onTxSuccess}
      withSpinner
      {...otherProps}
    />
  )
}

export default FollowSpaceButton
