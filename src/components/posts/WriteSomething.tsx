import clsx from 'clsx'
import { ComponentProps, useState } from 'react'
import { useSendEvent } from 'src/providers/AnalyticContext'
import {
  useSelectProfile,
  useSelectSpaceIdsWhereAccountCanPostWithLoadingStatus,
} from 'src/rtk/app/hooks'
import { selectSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { useMyAddress } from '../auth/MyAccountsContext'
import Avatar from '../profiles/address-views/Avatar'
import { newSpaceUrl } from '../urls'
import Segment from '../utils/Segment'
import { PostEditorModal } from './editor/ModalEditor'
import styles from './WriteSomething.module.sass'

export type WriteSomethingProps = ComponentProps<'div'> & {
  defaultSpaceId?: string
}

export default function WriteSomething({ defaultSpaceId, ...props }: WriteSomethingProps) {
  const sendEvent = useSendEvent()
  const [visible, setVisible] = useState(false)
  const myAddress = useMyAddress() ?? ''
  const profileData = useSelectProfile(myAddress)

  const { isLoading, spaceIds: ids } =
    useSelectSpaceIdsWhereAccountCanPostWithLoadingStatus(myAddress)
  if (isLoading) {
    return null
  }

  const spaceIds = selectSpaceIdsThatCanSuggestIfSudo({ myAddress, spaceIds: ids })
  const anySpace = spaceIds[0]

  const onClickInput = () => {
    if (anySpace) {
      sendEvent('createpost_button_clicked', { eventSource: 'write-something' })
      setVisible(true)
      return
    }
  }

  const content = (
    <>
      <button className={styles.InputButton} onClick={onClickInput}>
        {anySpace ? 'Write something...' : 'Create a profile to start posting'}
      </button>
      <button className={styles.PostButton} disabled={!!anySpace}>
        {anySpace ? 'Post' : 'Create Profile'}
      </button>
    </>
  )

  return (
    <>
      <Segment {...props} className={clsx('d-flex', styles.WriteSomething, props.className)}>
        <div className='d-flex'>
          <Avatar address={myAddress} avatar={profileData?.content?.image} size={40} />
          {anySpace ? (
            content
          ) : (
            <a href={newSpaceUrl(true)} className='d-flex w-100'>
              {content}
            </a>
          )}
        </div>
      </Segment>
      <PostEditorModal
        defaultSpaceId={defaultSpaceId}
        visible={visible}
        onCancel={() => setVisible(false)}
      />
    </>
  )
}
