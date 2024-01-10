import { PlusCircleOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useSelectSpaceIdsWhereAccountCanPostWithLoadingStatus } from 'src/rtk/app/hooks'
import { selectSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { useMyAddress } from '../auth/MyAccountsContext'
import { useResponsiveSize } from '../responsive'
import { CreateSpaceButton, CreateSpaceButtonProps, CreateSpaceIcon } from '../spaces/helpers'
import { BareProps } from '../utils/types'
import { PostEditorModal } from './editor/ModalEditor'

/**
 * The logic of this component:
 * - Shows "Create Space" in top menu if a current user has no spaces yet.
 * - Shows "New Post" in top menu if a current user has spaces.
 *   - Redirects to "New Post" page if user has only one space.
 *   - Opens "Space Selector" modal if user has more than one space.
 */

const CreateSpaceAdaptiveButton = (props: BareProps & CreateSpaceButtonProps) => {
  const { isMobile } = useResponsiveSize()

  return isMobile ? <CreateSpaceIcon {...props} /> : <CreateSpaceButton ghost={true} {...props} />
}

export function CreatePostButtonAndModal({
  children,
}: {
  children: (onClick: () => void) => React.ReactNode
}) {
  const [visible, setVisible] = useState(false)
  const { asPath } = useRouter()

  useEffect(() => {
    setVisible(false)
  }, [asPath])

  /** Go to new post form or show the space selector modal. */
  const onNewPostClick = () => {
    setVisible(true)
  }

  return (
    <>
      {children(onNewPostClick)}
      {visible && <PostEditorModal visible={visible} onCancel={() => setVisible(false)} />}
    </>
  )
}

const NewPostButtonAndModal = () => {
  const { isMobile } = useResponsiveSize()
  const [visible, setVisible] = useState(false)
  const { asPath } = useRouter()
  const sendEvent = useSendEvent()

  useEffect(() => {
    setVisible(false)
  }, [asPath])

  /** Go to new post form or show the space selector modal. */
  const onNewPostClick = () => {
    sendEvent('createpost_button_clicked', { eventSource: 'top' })
    setVisible(true)
  }

  return (
    <>
      {isMobile ? (
        <Tooltip title={'New post'}>
          <PlusCircleOutlined className='DfHoverIcon' onClick={onNewPostClick} />
        </Tooltip>
      ) : (
        <Button onClick={onNewPostClick}>New post</Button>
      )}
      {visible && <PostEditorModal visible={visible} onCancel={() => setVisible(false)} />}
    </>
  )
}

export function NewPostButtonInTopMenu() {
  const myAddress = useMyAddress()

  const { isLoading, spaceIds: ids } =
    useSelectSpaceIdsWhereAccountCanPostWithLoadingStatus(myAddress)
  if (isLoading) {
    return null
  }

  const spaceIds = selectSpaceIdsThatCanSuggestIfSudo({ myAddress, spaceIds: ids })
  const anySpace = spaceIds[0]
  if (!anySpace) return <CreateSpaceAdaptiveButton asProfile />

  return <NewPostButtonAndModal />
}
