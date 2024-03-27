import { Menu } from 'antd'
import { Donate } from 'src/components/donate'
import CustomLink from 'src/components/referral/CustomLink'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import { editSpaceUrl } from 'src/components/urls'
import { isHidden, ViewOnIpfs } from 'src/components/utils'
import { BasicDropDownMenuProps, DropdownMenu } from 'src/components/utils/DropDownMenu'
import { showSuccessMessage } from 'src/components/utils/Message'
import { useHasUserASpacePermission } from 'src/permissions/checkPermission'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useSetChatEntityConfig, useSetChatOpen } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { useIsCreatorSpace } from 'src/rtk/features/creators/creatorsListHooks'
import { SpaceData } from 'src/types'
import { useSelectProfile } from '../../../rtk/features/profiles/profilesHooks'
import { useMyAddress } from '../../auth/MyAccountsContext'
import { ProfileSpaceAction } from '../../profiles/address-views/utils/index'
import HiddenSpaceButton from '../HiddenSpaceButton'
import { EditPermissionsLink } from '../permissions/editSpacePermissionsModal'
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
  const isMobile = useIsMobileWidthOrDevice()
  const setChatConfig = useSetChatEntityConfig()

  // const isUsingEmail = useIsUsingEmail()

  const showMakeAsProfileButton = isMySpace && (!profileSpaceId || profileSpaceId !== id)

  const sendEvent = useSendEvent()
  const { isCreatorSpace } = useIsCreatorSpace(struct.id)
  const hasChatSetup = useAppSelector(state => !!state.chat.entity)
  const setChatOpen = useSetChatOpen()

  const buildMenuItems = () => {
    sendEvent('open_space_dropdown_menu')

    return (
      <>
        {isCreatorSpace && hasChatSetup && isMobile && (
          <Menu.Item
            key={`open-chat-${spaceKey}`}
            onClick={() => {
              setChatConfig({
                entity: { data: props.spaceData, type: 'space' },
                withFloatingButton: false,
              })
              setChatOpen(true)
              sendEvent('creator_chat_opened', { spaceId: id })
            }}
          >
            <span className='item'>Creator chat</span>
          </Menu.Item>
        )}
        {isMySpace && (
          <Menu.Item key={`edit-space-${spaceKey}`}>
            <CustomLink href={'/[spaceId]/edit'} as={editSpaceUrl(struct)}>
              <a className='item'>Edit space</a>
            </CustomLink>
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
            <CustomLink {...createNewPostLinkProps(struct)}>
              <a className='item'>Write post</a>
            </CustomLink>
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
              <EditPermissionsLink space={struct} />
            </Menu.Item>
            {/* {!isUsingEmail && (
              <>
                <Menu.Item key={`transfer-ownership-${spaceKey}`}>
                  <TransferOwnershipLink space={struct} />
                </Menu.Item>
              </>
            )} */}
          </>
        )}
        <Menu.Item key={`view-on-ipfs-${spaceKey}`}>
          <ViewOnIpfs contentId={struct.contentId} />
        </Menu.Item>
        <Menu.Item key={`copy-space-id-${spaceKey}`}>
          <span
            onClick={() => {
              navigator.clipboard.writeText(id)
              showSuccessMessage('Space Id copied to clipboard')
            }}
          >
            Copy Space Id: {id}
          </span>
        </Menu.Item>
      </>
    )
  }

  return <DropdownMenu buildMenuItems={buildMenuItems} {...otherProps} />
}
