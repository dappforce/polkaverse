import { Menu } from 'antd'
import Link from 'next/link'
import { Donate } from 'src/components/donate'
import { editSpaceUrl } from 'src/components/urls'
import { isHidden, ViewOnIpfs } from 'src/components/utils'
import { BasicDropDownMenuProps, DropdownMenu } from 'src/components/utils/DropDownMenu'
import { useSendGaUserEvent } from 'src/ga'
import { useHasUserASpacePermission } from 'src/permissions/checkPermission'
import { SpaceData } from 'src/types'
import { useSelectProfile } from '../../../rtk/features/profiles/profilesHooks'
import { useMyAddress } from '../../auth/MyAccountsContext'
import { ProfileSpaceAction } from '../../profiles/address-views/utils/index'
import HiddenSpaceButton from '../HiddenSpaceButton'
import { OpenEditPermissions } from '../permissions/EditPermissionsModal'
import EditorsLink from '../roles/Editors'
import { TransferOwnershipLink } from '../TransferSpaceOwnership'
import { createNewPostLinkProps, useIsMySpace } from './common'

type SpaceDropDownProps = BasicDropDownMenuProps & {
  spaceData: SpaceData
  spaceOwnerId: string
}

export const SpaceDropdownMenu = (props: SpaceDropDownProps) => {
  const {
    spaceData: { struct },
    spaceOwnerId,
    ...otherProps
  } = props
  const { id } = struct
  const spaceKey = `space-${id.toString()}`
  const canCreatePost = useHasUserASpacePermission({ space: struct, permission: 'CreatePosts' })
  const isMySpace = useIsMySpace(struct)
  const address = useMyAddress()
  const { id: profileSpaceId } = useSelectProfile(address) || {}

  const showMakeAsProfileButton = isMySpace && (!profileSpaceId || profileSpaceId !== id)

  const sendGaEvent = useSendGaUserEvent()

  const buildMenuItems = () => {
    sendGaEvent('Open space dropdown menu')

    return (
      <>
        {isMySpace && (
          <Menu.Item key={`edit-space-${spaceKey}`}>
            <Link href={'/[spaceId]/edit'} as={editSpaceUrl(struct)}>
              <a className='item'>Edit space</a>
            </Link>
          </Menu.Item>
        )}
        {!isMySpace && (
          <Menu.Item key={`donate-${spaceKey}`}>
            <Donate
              recipientAddress={spaceOwnerId}
              renderButtonElement={onClick => (
                <span className='d-block' onClick={onClick}>
                  Tip
                </span>
              )}
            />
          </Menu.Item>
        )}
        {!canCreatePost || isHidden(struct) ? null : (
          <Menu.Item key={`create-post-${spaceKey}`}>
            <Link {...createNewPostLinkProps(struct)}>
              <a className='item'>Write post</a>
            </Link>
          </Menu.Item>
        )}

        {showMakeAsProfileButton && (
          <Menu.Item key={`set-profile-${spaceKey}`}>
            <ProfileSpaceAction spaceId={id} address={address} asLink />
          </Menu.Item>
        )}
        {isMySpace && profileSpaceId === id && (
          <Menu.Item key={`reset-${spaceKey}`}>
            <ProfileSpaceAction
              spaceId={id}
              address={address}
              asLink
              label='Unlink profile'
              reset={true}
            />
          </Menu.Item>
        )}

        {isMySpace && (
          <>
            <Menu.Item key={`hidden-${spaceKey}`}>
              <HiddenSpaceButton space={struct} asLink />
            </Menu.Item>
            <Menu.Item key={`edit-permissions-${spaceKey}`}>
              <OpenEditPermissions space={struct} />
            </Menu.Item>
            <Menu.Item key={`edit-editors-${spaceKey}`}>
              <EditorsLink space={struct} />
            </Menu.Item>
            <Menu.Item key={`transfer-ownership-${spaceKey}`}>
              <TransferOwnershipLink space={struct} />
            </Menu.Item>
          </>
        )}
        {/* {struct.createdAtBlock && <Menu.Item key={`view-on-block-${spaceKey}`}>
        <ViewOnBlockchainLink createdAtBlock={struct.createdAtBlock} />
      </Menu.Item>} */}
        <Menu.Item key={`view-on-ipfs-${spaceKey}`}>
          <ViewOnIpfs contentId={struct.contentId} />
        </Menu.Item>
        {/* <ViewOnDropDownMenuItems struct={struct} /> */}
      </>
    )
  }

  return <DropdownMenu buildMenuItems={buildMenuItems} {...otherProps} />
}
