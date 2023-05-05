import Modal from 'antd/lib/modal/Modal'
import clsx from 'clsx'
import { useState } from 'react'
import { useMyAddress } from '../auth/MyAccountsContext'
import { MutedSpan } from '../utils/MutedText'
import styles from './ConfirmationModal.module.sass'

import useSignerExternalStorage from 'src/hooks/useSignerExternalStorage'
import {
  useEnableConfirmationModalOpenState,
  useOpenCloseEnableConfirmationModal,
} from 'src/rtk/features/confirmationPopup/useOpenCloseEnableConfirmationModal'
import { useIsProxyAddedContext } from '../onboarding/contexts/IsProxyAdded'
import PartialContinueButton from '../onboarding/OnBoardingModal/steps/Signer/ContinueButton'
import LoadingTransaction from '../utils/LoadingTransaction'

export default function ConfirmationModal() {
  const openState = useEnableConfirmationModalOpenState()
  const openCloseEnableConfirmationModal = useOpenCloseEnableConfirmationModal()
  const myAddress = useMyAddress()
  const { setSignerProxyAdded } = useSignerExternalStorage()
  const { setIsProxyAdded } = useIsProxyAddedContext()

  const [loading, setLoading] = useState(false)

  const handleSuccess = () => {
    openCloseEnableConfirmationModal('close')
    setSignerProxyAdded('disabled', myAddress!)
    setIsProxyAdded(false)
  }

  const title = loading ? '🕔 Please wait' : '✅ Enable confirmation pop-ups'
  const subtitle = loading
    ? 'We are recording your information on the blockchain.'
    : 'PolkaVerse will stop remembering you, meaning it cannot automatically approve your social actions. You will have to manually confirm all of them yourself, as PolkaVerse will not be able to do it for you.'

  return (
    <Modal
      visible={openState}
      destroyOnClose
      onCancel={() => openCloseEnableConfirmationModal('close')}
      footer={null}
      className={clsx(styles.DfOnBoardingModal)}
    >
      <>
        <div className={clsx('mb-3 mr-4')}>
          <h2 className={styles.Title}>{title}</h2>
          <MutedSpan>{subtitle}</MutedSpan>
        </div>
        {loading && (
          <div className='m-auto'>
            <LoadingTransaction />
          </div>
        )}
        {!loading && (
          <>
            <div className={clsx(styles.ContentContainer, styles.ContentImage)}>
              <img
                className='on-boarding-confirmationless-image'
                src='/images/onboarding/no-confirm.png'
              />
            </div>
            <div className='mt-auto'>
              <PartialContinueButton
                loading={loading}
                setLoading={setLoading}
                onSuccess={handleSuccess}
                isRemovingProxy={true}
                label={'Enable confirmation pop-ups'}
              />
            </div>
          </>
        )}
      </>
    </Modal>
  )
}
