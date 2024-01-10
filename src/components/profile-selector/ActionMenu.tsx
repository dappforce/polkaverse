import {
  EditOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  TagsOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { isEmptyArray } from '@subsocial/utils'
import { Menu } from 'antd'
import Link from 'next/link'
import { BiUserPin } from 'react-icons/bi'
import { BsCaretRight } from 'react-icons/bs'
import config from 'src/config'
import { useAppSelector } from 'src/rtk/app/store'
import { selectProfileSpaceStructById } from 'src/rtk/features/profiles/profilesSlice'
import { selectSpaceIdsWithRolesByAccount } from 'src/rtk/features/spaceIds/spaceIdsWithRolesByAccountSlice'
import { SpaceId } from 'src/types'
import { useMyDomains } from '../../rtk/features/domains/domainHooks'
import { selectSpaceIdsByOwner } from '../../rtk/features/spaceIds/ownSpaceIdsSlice'
import { useMyAddress } from '../auth/MyAccountsContext'
import { useShowOnBoardingSidebarContext } from '../onboarding/contexts/ShowOnBoardingSidebarContext'
import { AccountFollowersModal, AccountFollowingModal } from '../profiles/AccountsListModal'
import { CreateOrEditProfileSpace, SettingsLink } from '../profiles/address-views/utils/index'
import { SwitchProfileSpaceButton } from '../profiles/address-views/utils/SwitchProfileSpaceModal'
import ViewProfileLink from '../profiles/ViewProfileLink'
import { SpacesWithRolesByAccountModal } from '../spaces/AccountSpaces'
import { SubIcon } from '../utils'
import { useMyAccountDrawer } from './MyAccountMenu'

const { enableEmailSettings, enableDomains } = config

const OnBoardingIcon = (
  <SubIcon Icon={BsCaretRight} className='position-relative' style={{ left: '-1.5px' }} />
)
const FollowingIcon = <LogoutOutlined />
const FollowersIcon = <LoginOutlined />
const MyProfileIcon = <UserOutlined />
const SwithcProfileSpace = <UserSwitchOutlined />
const EditProfileIcon = <EditOutlined />
const MyRolesIcon = <TagsOutlined />
const SettingsIcon = <SettingOutlined />
const MyDomainsIcon = <SubIcon Icon={BiUserPin} />

const emptyArr: SpaceId[] = []

export const ActionMenu = () => {
  const address = useMyAddress()
  const { close } = useMyAccountDrawer()

  const { showOnBoardingSidebar, setShowOnBoardingSidebar } = useShowOnBoardingSidebarContext()

  const profileSpaceByAccount = useAppSelector(state =>
    address ? selectProfileSpaceStructById(state, address) : undefined,
  )

  const ownSpaceIds =
    useAppSelector(state => (address ? selectSpaceIdsByOwner(state, address) : [])) || []

  const { accountFollowedCount, accountFollowersCount } = profileSpaceByAccount || {}

  const hasMyRoles = !!useAppSelector(state =>
    address ? selectSpaceIdsWithRolesByAccount(state, address) : emptyArr,
  )?.length

  const { domains } = useMyDomains()

  const hasFollowers = !!accountFollowersCount
  const hasFollowing = !!accountFollowedCount
  const hasDomains = enableDomains && !isEmptyArray(domains)

  if (!address) return null

  const continueOnBoarding = () => {
    setShowOnBoardingSidebar(true)
    close()
  }

  return (
    <>
      <Menu className='FontNormal'>
        {!showOnBoardingSidebar && (
          <Menu.Item key='onboarding' icon={OnBoardingIcon}>
            <span onClick={continueOnBoarding}>Show Quickstart</span>
          </Menu.Item>
        )}
        {hasFollowing && (
          <Menu.Item key='following' icon={FollowingIcon}>
            <AccountFollowingModal
              address={address}
              pluralizeTitle='Following'
              renderOpenButton={(open, count) => <a onClick={open}>{`My following (${count})`}</a>}
            />
          </Menu.Item>
        )}
        {hasFollowers && (
          <Menu.Item key='followers' icon={FollowersIcon}>
            <AccountFollowersModal
              address={address}
              pluralizeTitle='Follower'
              renderOpenButton={(open, count) => <a onClick={open}>{`My followers (${count})`}</a>}
            />
          </Menu.Item>
        )}

        <Menu.Item key='my-profile' icon={MyProfileIcon}>
          <ViewProfileLink account={{ address }} title='My profile' />
        </Menu.Item>
        <Menu.Item key='edit' icon={EditProfileIcon}>
          <CreateOrEditProfileSpace address={address} onClick={close} />
        </Menu.Item>
        {ownSpaceIds.length > 1 && (
          <Menu.Item key='switch-profile-space' icon={SwithcProfileSpace}>
            <SwitchProfileSpaceButton />
          </Menu.Item>
        )}

        {hasDomains && (
          <Menu.Item key='domains' icon={MyDomainsIcon}>
            <Link href='/dd' as='/dd'>
              <a onClick={close}>My Domains</a>
            </Link>
          </Menu.Item>
        )}

        {hasMyRoles && (
          <Menu.Item key='roles' icon={MyRolesIcon}>
            <SpacesWithRolesByAccountModal
              address={address}
              width={678}
              title='You can create posts in the next spaces'
              renderOpenButton={(open, count) => <a onClick={open}>{`My roles (${count})`}</a>}
            />
          </Menu.Item>
        )}

        {enableEmailSettings && (
          <Menu.Item key='settings' icon={SettingsIcon}>
            <SettingsLink address={address} onClick={close} />
          </Menu.Item>
        )}
      </Menu>
    </>
  )
}
