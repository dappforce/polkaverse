import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import config from 'src/config'
import { useBooleanExternalStorage } from 'src/hooks/useExternalStorage'
import { useMyAccount } from 'src/stores/my-account'
import { useIsMobileWidthOrDevice } from '../responsive'
import SpacesSuggestedForOnBoarding from '../spaces/SpacesSuggestedForOnBoarding'
import { useSubsocialApi } from '../substrate'
import CustomModal from '../utils/CustomModal'
import ResolvedTxButton from '../utils/TxButton'
import { useIsOnBoardingSkippedContext } from './contexts/IsOnBoardingSkippedContext'
import styles from './OnBoardingModal/OnBoardingModal.module.sass'

export const ON_BOARDING_MODAL_KEY = 'onBoardingModalFinished'
const { recommendedSpaceIds } = config
const shuffledRecommendedSpaceIds = recommendedSpaceIds.sort(() => Math.random() - 0.5)

export default function RecommendedSpacesOnboarding() {
  const myAddress = useMyAddress()
  const isMobile = useIsMobileWidthOrDevice()
  const isInitializedProxy = useMyAccount(state => state.isInitializedProxy)
  const { data: isFinishedOnBoarding, setData: setIsFinishedOnBoarding } =
    useBooleanExternalStorage(ON_BOARDING_MODAL_KEY, {
      storageKeyType: 'user',
    })
  const { setIsOnBoardingSkipped } = useIsOnBoardingSkippedContext()
  const { api } = useSubsocialApi()

  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([])
  const spacesSet = useMemo(() => {
    if (!selectedSpaces) return new Set<string>()
    return new Set(selectedSpaces)
  }, [selectedSpaces])

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isInitializedProxy && !isFinishedOnBoarding && myAddress) setIsOpen(true)
  }, [myAddress, isInitializedProxy, isFinishedOnBoarding])

  const closeModal = () => {
    setIsOpen(false)
    setIsFinishedOnBoarding(true)
    setIsOnBoardingSkipped(true)
  }

  return (
    <CustomModal
      title='💫 Follow recommended spaces'
      subtitle='Following a space will show posts from that space in your feed.'
      visible={isOpen}
      destroyOnClose
      closable
      maskClosable
      keyboard
      onCancel={closeModal}
      className={clsx(styles.DfOnBoardingModal, styles.DfOnboardingSignerModal)}
    >
      <div
        className='d-flex flex-column scrollbar pr-2'
        style={{
          maxHeight: isMobile ? '435px' : '480px',
          overflow: 'auto',
        }}
      >
        <SpacesSuggestedForOnBoarding
          shouldDisplayFollowedSpaces={false}
          spaceIds={shuffledRecommendedSpaceIds}
          isSmallPreview
          customFollowButton={{
            buttonProps: {
              className: 'ml-2',
            },
            onClick: (space, type) => {
              const currentSpaces = new Set(spacesSet)
              if (type === 'follow') {
                currentSpaces.add(space.id)
              } else {
                currentSpaces.delete(space.id)
              }
              setSelectedSpaces(Array.from(currentSpaces))
            },
            isFollowed: spaceId => spacesSet.has(spaceId),
          }}
          maxItems={12}
        />
      </div>
      <div style={{ marginTop: 'auto' }}>
        <ResolvedTxButton
          tx='utility.batch'
          className='mt-4'
          block
          size='large'
          type='primary'
          params={() => [selectedSpaces.map(id => api.tx.spaceFollows.followSpace(id))]}
          disabled={selectedSpaces.length === 0}
          onSend={() => closeModal()}
        >
          Finish
        </ResolvedTxButton>
      </div>
    </CustomModal>
  )
}
