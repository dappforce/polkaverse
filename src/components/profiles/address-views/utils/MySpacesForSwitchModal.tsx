import { isEmptyArray } from '@subsocial/utils'
import { Tooltip } from 'antd'
import React from 'react'
import SubstrateTxButton from 'src/components/substrate/SubstrateTxButton'
import { DataSourceTypes } from 'src/types'
import { useAppDispatch, useAppSelector } from '../../../../rtk/app/store'
import { useSelectProfile } from '../../../../rtk/features/profiles/profilesHooks'
import { fetchProfileSpaces } from '../../../../rtk/features/profiles/profilesSlice'
import { selectSpaceIdsByOwner } from '../../../../rtk/features/spaceIds/ownSpaceIdsSlice'
import { useFetchSpaces } from '../../../../rtk/features/spaces/spacesHooks'
import { useMyAddress } from '../../../auth/MyAccountsContext'
import { LineSpacePreview } from '../../../spaces/LineSpacePreview'
import { useSubsocialApi } from '../../../substrate/SubstrateContext'
import NoData from '../../../utils/EmptyList'
import { LoadingSpaces } from '../../../utils/index'
import styles from './Index.module.sass'

type SpaceItemProps = {
  address?: string
  spaceId: string
  profileSpaceId?: string
  hide?: () => void
}

type SpaceItemCompProps = {
  children?: React.ReactNode
  className?: string
}

const SpaceItem = ({ address, spaceId, profileSpaceId, hide }: SpaceItemProps) => {
  const dispatch = useAppDispatch()
  const { subsocial } = useSubsocialApi()

  const getTxParams = () => [spaceId]

  const onSuccess = () => {
    address &&
      dispatch(
        fetchProfileSpaces({
          api: subsocial,
          ids: [address.toString() || ''],
          reload: true,
          dataSource: DataSourceTypes.CHAIN,
        }),
      )
    hide?.()
  }

  const Component: React.FunctionComponent<SpaceItemCompProps> = compProps => (
    <div {...compProps}>
      <LineSpacePreview noLink spaceId={spaceId} withFollowButton={false} />
    </div>
  )

  return profileSpaceId === spaceId ? (
    <Component className={styles.PrevieWithoutHover} />
  ) : (
    <Tooltip className={styles.DfSpacePreview} title='Click to change current profile'>
      <SubstrateTxButton
        tx='profiles.setProfile'
        size='middle'
        accountId={address}
        params={getTxParams}
        label='Make as profile space'
        successMessage='The space was made as a profile'
        onSuccess={onSuccess}
        component={Component}
      />
    </Tooltip>
  )
}

type MySpacesForWitchModalProps = {
  hide?: () => void
}

export const MySpacesForSwitchModal = ({ hide }: MySpacesForWitchModalProps) => {
  const address = useMyAddress()
  const { id: profileSpaceId } = useSelectProfile(address) || {}
  const ownSpaceIds: string[] = useAppSelector(
    state => selectSpaceIdsByOwner(state, address || '') || [],
  )
  const { loading } = useFetchSpaces({ ids: ownSpaceIds, dataSource: DataSourceTypes.CHAIN })

  if (loading) return <LoadingSpaces />

  return (
    <>
      {isEmptyArray(ownSpaceIds) ? (
        <NoData />
      ) : (
        ownSpaceIds.map(spaceId => {
          return (
            <SpaceItem
              key={spaceId}
              address={address}
              spaceId={spaceId}
              profileSpaceId={profileSpaceId}
              hide={hide}
            />
          )
        })
      )}
    </>
  )
}

export default MySpacesForSwitchModal
