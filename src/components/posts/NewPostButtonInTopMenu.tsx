import { PlusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSelectSpaceIdsWhereAccountCanPost } from 'src/rtk/app/hooks'
import { selectSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { useMyAddress } from '../auth/MyAccountsContext'
import { useResponsiveSize } from '../responsive'
import { CreateSpaceButton, CreateSpaceIcon } from '../spaces/helpers'
import { BareProps } from '../utils/types'
import { PostEditorModal } from './editor/ModalEditor'

/**
 * The logic of this component:
 * - Shows "Create Space" in top menu if a current user has no spaces yet.
 * - Shows "New Post" in top menu if a current user has spaces.
 *   - Redirects to "New Post" page if user has only one space.
 *   - Opens "Space Selector" modal if user has more than one space.
 */

const CreateSpaceAdaptiveButton = (props: BareProps) => {
  const { isMobile } = useResponsiveSize()

  return isMobile ? <CreateSpaceIcon {...props} /> : <CreateSpaceButton ghost={true} {...props} />
}

const CreatePostIcon = <PlusOutlined />

const NewPostButtonAndModal = () => {
  const { isMobile } = useResponsiveSize()
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
      {isMobile ? (
        <Tooltip title={'New post'}>
          <PlusCircleOutlined className='DfHoverIcon' onClick={onNewPostClick} />
        </Tooltip>
      ) : (
        <Button icon={CreatePostIcon} onClick={onNewPostClick}>
          New post
        </Button>
      )}
      {visible && <PostEditorModal visible={visible} onCancel={() => setVisible(false)} />}
    </>
  )
}

export function NewPostButtonInTopMenu() {
  const myAddress = useMyAddress()

  const ids = useSelectSpaceIdsWhereAccountCanPost(myAddress)
  const spaceIds = selectSpaceIdsThatCanSuggestIfSudo({ myAddress, spaceIds: ids })

  const anySpace = spaceIds[0]
  if (!anySpace) return <CreateSpaceAdaptiveButton />

  return <NewPostButtonAndModal />
}
