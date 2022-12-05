import { useState } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { PostEditorModal } from 'src/components/posts/editor/ModalEditor'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { selectPostIdsByOwner } from 'src/rtk/features/posts/ownPostIdsSlice'
import OnBoardingSidebarButton from '../OnBoardingSidebarButton'

export default function WritePostButton() {
  const [isOpenModal, setIsOpenModal] = useState(false)
  const myAddress = useMyAddress()
  const profileSpace = useSelectProfile(myAddress)

  const myPostIds = useAppSelector(state => selectPostIdsByOwner(state, myAddress ?? ''))
  const postsCount = myPostIds?.length

  if (!profileSpace || (postsCount && postsCount > 0)) return null

  return (
    <>
      <OnBoardingSidebarButton
        onClick={() => setIsOpenModal(true)}
        text='Write your first post'
        emoji='✍️'
      />
      <PostEditorModal
        destroyOnClose
        visible={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
      />
    </>
  )
}
