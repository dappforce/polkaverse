import { PlusOutlined, WarningFilled } from '@ant-design/icons'
import { AccountId } from '@polkadot/types/interfaces'
import { isEmptyStr } from '@subsocial/utils'
import { Alert, Button } from 'antd'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config'
import { getInitialPropsWithRedux } from 'src/rtk/app'
import {
  fetchProfileSpace,
  selectProfileSpace,
  selectProfileSpaceStructById,
} from 'src/rtk/features/profiles/profilesSlice'
import { AnyAccountId, DataSourceTypes, ProfileContent, ProfileData, SpaceData } from 'src/types'
import { AccountActivity } from '../activity/AccountActivity'
import { useIsMyAddress, useMyAccountsContext } from '../auth/MyAccountsContext'
import { NativeBalance } from '../common/balances'
import { PageContent } from '../main/PageWrapper'
import { accountUrl, newSpaceUrl } from '../urls'
import { DfMd } from '../utils/DfMd'
import { MutedDiv } from '../utils/MutedText'
import MyEntityLabel from '../utils/MyEntityLabel'
import { Pluralize } from '../utils/Plularize'
import Section from '../utils/Section'
import { AccountFollowersModal, AccountFollowingModal } from './AccountsListModal'
import Avatar from './address-views/Avatar'
import Name from './address-views/Name'
import { CopyAddress } from './address-views/utils'

import router from 'next/router'
import { Donate } from 'src/components/donate'
import { isBlockedAccount } from 'src/moderation'
import { useFetchSpaceIdsByFollower, useIsMuted } from 'src/rtk/app/hooks'
import { useIsBlocked } from 'src/rtk/features/moderation/hooks'
import { fetchEntityOfSpaceIdsByFollower } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import { convertToSubsocialAddress } from 'src/utils/address'
import { useAppSelector } from '../../rtk/app/store'
import { useSelectProfile } from '../../rtk/features/profiles/profilesHooks'
import { fetchSpaceIdsOwnedByAccount } from '../../rtk/features/spaceIds/ownSpaceIdsSlice'
import { selectSpace } from '../../rtk/features/spaces/spacesSlice'
import BlockedAlert from '../moderation/BlockedAlert'
import CustomLink from '../referral/CustomLink'

const FollowAccountButton = dynamic(() => import('../utils/FollowAccountButton'), { ssr: false })

export type Props = {
  address: AnyAccountId
  owner?: ProfileData
  followers?: AccountId[]
  spacesData?: SpaceData[]
  size?: number
}

const Component = (props: Props) => {
  const { address, size = LARGE_AVATAR_SIZE } = props

  const isMuted = useIsMuted(props.address.toString())

  const owner = useSelectProfile(address.toString()) || props.owner
  const profileSpaceByAccount = useAppSelector(state =>
    address ? selectProfileSpaceStructById(state, address.toString()) : undefined,
  )
  const isMyAccount = useIsMyAddress(address)
  const shouldHideContent = isBlockedAccount(address.toString()) && !isMyAccount
  const { spaceIds } = useFetchSpaceIdsByFollower(props.address.toString(), DataSourceTypes.SQUID)

  const noProfile = !owner?.struct

  const { accountFollowersCount, accountFollowedCount } = profileSpaceByAccount || {}

  const followers = accountFollowersCount || 0
  const following = (accountFollowedCount || 0) + spaceIds.length

  if (shouldHideContent && owner) {
    owner.content = undefined
  }

  const { image, about } = owner?.content || ({} as ProfileContent)

  const createProfileButton = noProfile && isMyAccount && (
    <CustomLink href={newSpaceUrl(true)}>
      <Button type='primary' ghost>
        <PlusOutlined />
        Create profile
      </Button>
    </CustomLink>
  )

  const followersText = <Pluralize count={followers} singularText='Follower' />
  const followingText = <Pluralize count={following} singularText='Following' />

  const { state } = useMyAccountsContext()
  const { emailAccounts } = state

  const myEmailAccount = emailAccounts?.find(
    emailAccount => emailAccount.accountAddress === address,
  )

  const NameOrEmail =
    isMyAccount && myEmailAccount ? (
      <Name
        address={address}
        isOnViewProfile={true}
        emailAddress={myEmailAccount.email}
        className='mr-2'
      />
    ) : (
      <Name owner={owner} address={address} className='mr-2' />
    )

  return (
    <Section outerClassName='mb-2'>
      <div className='d-flex flex-column w-100'>
        {isMuted && (
          <Alert
            message={
              <div className='d-flex align-items-center GapTiny'>
                <WarningFilled style={{ color: 'orange' }} />
                <span>You muted this account</span>
              </div>
            }
            type='warning'
            className='mb-3'
          />
        )}
        <div className='d-flex mb-3'>
          <Avatar
            size={size || LARGE_AVATAR_SIZE}
            address={address}
            avatar={image}
            avatarPreview={true}
          />
          <div className='ml-1 w-100'>
            <h1 className='header DfAccountTitle justify-content-between mb-2'>
              <span className='d-flex align-items-center'>
                {NameOrEmail}
                <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>
              </span>
            </h1>
            <MutedDiv>
              {'Address: '}
              <CopyAddress address={address}>
                <span className='DfGreyLink'>{address}</span>
              </CopyAddress>
            </MutedDiv>
            <MutedDiv>
              <NativeBalance address={address} label='Balance: ' />
            </MutedDiv>
            {/* <MutedDiv>{`Reputation: ${reputation}`}</MutedDiv> */}
            <div className='about'>{about && <DfMd className='mt-3' source={about} />}</div>
            <div className='mt-3'>
              <AccountFollowersModal
                address={address}
                title={followersText}
                renderOpenButton={(open, count) => (
                  <span
                    onClick={() => count && open()}
                    className={`${!count && 'disable'} DfProfileModalLink`}
                  >
                    {followersText}
                  </span>
                )}
              />

              <AccountFollowingModal
                address={address}
                title={followingText}
                renderOpenButton={(open, count) => (
                  <span
                    onClick={() => count && open()}
                    className={`${!count && 'disable'} DfProfileModalLink`}
                  >
                    {followingText}
                  </span>
                )}
              />
              <div className='mt-3'>
                {createProfileButton}
                {!isMyAccount && <Donate recipientAddress={address.toString()} />}
                <FollowAccountButton address={address} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

const ProfilePage: NextPage<Props> = props => {
  const { address, owner } = props
  const shouldHideContent = isBlockedAccount(address.toString())
  const isBlocked = useIsBlocked(address.toString())

  if (shouldHideContent && owner) {
    owner.content = undefined
  }

  const content = owner?.content || ({} as ProfileContent)
  const { name, image } = content
  const isOnlyAddress = isEmptyStr(name)

  const getName = () => {
    if (isOnlyAddress) {
      return address.toString()
    } else {
      return name
    }
  }

  return (
    <PageContent
      meta={{
        title: getName(),
        desc: content.about,
        image,
        canonical: accountUrl({ address }),
      }}
      withSidebar
      creatorDashboardSidebarType={{ name: 'home-page', variant: 'posts' }}
    >
      {isBlocked && <BlockedAlert />}
      <Component {...props} />
      {!shouldHideContent && <AccountActivity address={address.toString()} />}
    </PageContent>
  )
}

getInitialPropsWithRedux(ProfilePage, async ({ context, subsocial, dispatch, reduxStore }) => {
  const {
    query: { address },
    res,
    req,
  } = context

  const addressStr = address as string

  const subsocialAddress = convertToSubsocialAddress(addressStr)
  if (subsocialAddress !== addressStr) {
    if (req) {
      res?.writeHead(301, {
        Location: accountUrl({ address: subsocialAddress ?? '' }),
      })
      res?.end()
    } else {
      router.push(accountUrl({ address: subsocialAddress ?? '' }))
    }
    return { statusCode: 301 } as any
  }

  if (!addressStr) {
    if (res) {
      res.statusCode = 404
    }
    return { statusCode: 404 } as any
  }

  await dispatch(
    fetchProfileSpace({ api: subsocial, id: addressStr, reload: true, eagerLoadHandles: true }),
  )
  const spaceIdByAccount = selectProfileSpace(reduxStore.getState(), addressStr)

  const owner = spaceIdByAccount
    ? selectSpace(reduxStore.getState(), { id: spaceIdByAccount?.spaceId })
    : undefined

  await dispatch(fetchSpaceIdsOwnedByAccount({ api: subsocial, id: addressStr, reload: true }))
  await dispatch(fetchEntityOfSpaceIdsByFollower({ api: subsocial, id: addressStr, reload: true }))

  return {
    address: addressStr,
    owner,
  }
})

export default ProfilePage
