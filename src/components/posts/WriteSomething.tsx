import { InfoCircleFilled } from '@ant-design/icons'
import { Alert, Button } from 'antd'
import clsx from 'clsx'
import { ComponentProps, useState } from 'react'
import { getNeededLock } from 'src/config/constants'
import { useSendEvent } from 'src/providers/AnalyticContext'
import {
  useSelectProfile,
  useSelectSpaceIdsWhereAccountCanPostWithLoadingStatus,
} from 'src/rtk/app/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { selectSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { useMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import Avatar from '../profiles/address-views/Avatar'
import { useResponsiveSize } from '../responsive'
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
  const { data: totalStake, loading: loadingTotalStake } = useFetchTotalStake(myAddress)
  const neededLock = getNeededLock(totalStake?.amount)

  const { isSmallMobile } = useResponsiveSize()

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
        {!loadingTotalStake && neededLock > 0 && anySpace && (
          <Alert
            className={clsx(styles.Alert, 'mt-3')}
            message={
              <div
                className={clsx(
                  'd-flex align-items-center GapNormal justify-content-between',
                  isSmallMobile && 'flex-column align-items-stretch',
                )}
              >
                <div className='d-flex flex-column GapMini'>
                  <div className='d-flex align-items-center justify-content-between GapNormal'>
                    <div className='d-flex align-items-center'>
                      <InfoCircleFilled className='FontSmall' style={{ color: '#FAAD14' }} />
                      <span className='ml-2 FontWeightBold'>Post to Earn</span>
                    </div>
                  </div>
                  <div className='d-flex flex-column GapSmall align-items-start'>
                    <span style={{ color: '#262425CC' }}>
                      To start earning SUB rewards, increase your lock by at least{' '}
                      <FormatBalance
                        value={neededLock.toString()}
                        decimals={10}
                        currency='SUB'
                        precision={2}
                      />
                      .
                    </span>
                  </div>
                </div>
                <Button type='primary' shape='round'>
                  Increase Lock
                </Button>
              </div>
            }
            type='warning'
          />
        )}
      </Segment>
      <PostEditorModal
        defaultSpaceId={defaultSpaceId}
        visible={visible}
        onCancel={() => setVisible(false)}
      />
    </>
  )
}
