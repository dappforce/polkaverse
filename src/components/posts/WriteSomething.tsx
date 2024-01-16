import clsx from 'clsx'
import { ComponentProps, useState } from 'react'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useMyAddress } from '../auth/MyAccountsContext'
import Avatar from '../profiles/address-views/Avatar'
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

  const onClickInput = () => {
    sendEvent('createpost_button_clicked', { eventSource: 'write-something' })
    setVisible(true)
  }

  return (
    <>
      <Segment {...props} className={clsx('d-flex', styles.WriteSomething, props.className)}>
        <Avatar address={myAddress} avatar={profileData?.content?.image} size={40} />
        <button className={styles.InputButton} onClick={onClickInput}>
          Write something...
        </button>
        <button className={styles.PostButton} disabled>
          Post
        </button>
      </Segment>
      <PostEditorModal
        defaultSpaceId={defaultSpaceId}
        visible={visible}
        onCancel={() => setVisible(false)}
      />
    </>
  )
}
