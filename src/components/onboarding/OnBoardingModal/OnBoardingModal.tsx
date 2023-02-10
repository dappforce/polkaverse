import { Modal } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from 'src/components/auth/AuthContext'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { setFiltersInUrl } from 'src/components/main/utils'
import config from 'src/config'
import { useBooleanExternalStorage } from 'src/hooks/useExternalStorage'
import { useCreateReloadProfile, useCreateReloadSpaceIdsForMyAccount } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import {
  useCurrentOnBoardingStep,
  useIsDraftOnBoardingData,
  useOnBoardingModalOpenState,
  useOpenCloseOnBoardingModal,
} from 'src/rtk/features/onBoarding/onBoardingHooks'
import {
  goToStepOnBoardingModal,
  OnBoardingDataTypes,
  resetOnBoardingData,
} from 'src/rtk/features/onBoarding/onBoardingSlice'
import { DataSourceTypes } from 'src/types'
import { useIsFollowSpaceModalUsedContext } from '../contexts/IsFollowSpaceModalUsed'
import { useIsOnBoardingSkippedContext } from '../contexts/IsOnBoardingSkippedContext'
import useOnBoardingStepsOrder from '../hooks/useOnBoardingStepsOrder'
import styles from './OnBoardingModal.module.sass'
import Confirmation from './steps/Confirmation'
import Energy from './steps/Energy'
import Profile from './steps/Profile'
import Signer from './steps/Signer'
import Spaces from './steps/Spaces'
import Topics from './steps/Topics'
import { OnBoardingContentProps, OnBoardingModalProps } from './types'

const steps: {
  [key in keyof OnBoardingDataTypes]: {
    title: string | JSX.Element
    subtitle?: string | JSX.Element
    content: (props: OnBoardingContentProps) => JSX.Element
  }
} = {
  topics: {
    content: Topics,
    title: `🏄‍♂️ What do you want to see on ${config.appName}?`,
    subtitle: 'Your interests are used to show you personalized content.',
  },
  spaces: {
    content: Spaces,
    title: '💫 Follow recommended spaces',
    subtitle: 'Following a space will show posts from that space in your feed.',
  },
  profile: {
    content: Profile,
    title: '💫 Build your profile',
    subtitle: 'Later, you can create blogs and start groups.',
  },
  energy: {
    content: Energy,
    title: '⚡ Energy',
    subtitle: `Energy allows you to use ${config.appName}. You can create energy here by burning SUB or get a small amount of energy for free (only for new users), allowing you to start posting without getting tokens.`,
  },
  signer: {
    content: Signer,
    title: '🔒 Remembering you',
    subtitle:
      'Avoid approving every interaction with your wallet by allowing PolkaVerse to remember you. This only affects social actions; your assets will remain secure.',
  },
  confirmation: {
    content: Confirmation,
    title: '🏁 One more step...',
    subtitle: 'Now we will record your information on the blockchain by:',
  },
}

export const ON_BOARDING_MODAL_KEY = 'onBoardingModalFinished'

export default function OnBoardingModal({
  firstStepOffset = 1,
  onBackClickInFirstStep,
}: OnBoardingModalProps) {
  const router = useRouter()
  const myAddress = useMyAddress()
  const { data: isFinishedOnBoarding, setData: setIsFinishedOnBoarding } =
    useBooleanExternalStorage(ON_BOARDING_MODAL_KEY, {
      storageKeyType: 'user',
    })
  const { setIsOnBoardingSkipped } = useIsOnBoardingSkippedContext()
  const { setIsFollowSpaceModalUsed } = useIsFollowSpaceModalUsedContext()

  const isProfileDraft = useIsDraftOnBoardingData('profile')
  const isTopicsDraft = useIsDraftOnBoardingData('topics')
  const isFollowSpacesDraft = useIsDraftOnBoardingData('spaces')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const openState = useOnBoardingModalOpenState()
  const openCloseModal = useOpenCloseOnBoardingModal()

  const onBoardingModalStepsOrder = useOnBoardingStepsOrderWithEnergySnapshot()

  const currentStep = useCurrentOnBoardingStep()
  const currentStepIndex = useMemo(() => {
    return onBoardingModalStepsOrder.findIndex(key => key === currentStep)
  }, [currentStep])

  useEffect(() => {
    if (isFinishedOnBoarding === false && myAddress) openCloseModal('open')
  }, [isFinishedOnBoarding, myAddress])

  useEffect(() => {
    if (!currentStep && openState) {
      dispatch(goToStepOnBoardingModal(onBoardingModalStepsOrder[0]))
    }
  }, [currentStep, openState])

  const currentContent = currentStep && steps[currentStep]
  const Component = currentContent?.content

  const dispatch = useAppDispatch()

  const onBackClick = () => {
    if (currentStepIndex < 0) {
      dispatch(goToStepOnBoardingModal(onBoardingModalStepsOrder[0]))
    } else if (currentStepIndex === 0) {
      onBackClickInFirstStep && onBackClickInFirstStep()
    } else {
      dispatch(goToStepOnBoardingModal(onBoardingModalStepsOrder[currentStepIndex - 1]))
    }
  }

  const reloadMySpaceIds = useCreateReloadSpaceIdsForMyAccount()
  const reloadProfile = useCreateReloadProfile()
  const afterDoneOnBoarding = (isSkipped?: boolean) => {
    setLoading(false)
    setSuccess(false)
    openCloseModal('close')

    if (openState === 'full-on-boarding') {
      if (router.pathname === '/') {
        setFiltersInUrl(router, 'posts', { type: 'suggested', date: 'week' })
      }

      setIsFinishedOnBoarding(true)
      setIsOnBoardingSkipped(isSkipped)
    }

    if (!isSkipped) {
      dispatch(resetOnBoardingData())
      if (isProfileDraft === false || isTopicsDraft === false) {
        reloadProfile({ id: myAddress ?? '', dataSource: DataSourceTypes.CHAIN })
        reloadMySpaceIds()
      }
      if (isFollowSpacesDraft === false) {
        setIsFollowSpaceModalUsed(true)
      }
    }
  }

  const goToNextStep: OnBoardingContentProps['goToNextStep'] = config => {
    const nextStep = onBoardingModalStepsOrder[currentStepIndex + 1]
    if (nextStep && !config?.forceTerminateFlow) {
      dispatch(goToStepOnBoardingModal(nextStep))
      return
    }
    afterDoneOnBoarding(config?.isSkipped)
  }

  const modalClosable = !loading && openState === 'partial'

  return (
    <Modal
      visible={
        openState !== '' &&
        !(openState === 'full-on-boarding' && onBoardingModalStepsOrder.length === 0)
      }
      destroyOnClose
      closable={success || modalClosable}
      maskClosable={modalClosable}
      keyboard={modalClosable}
      onCancel={() => afterDoneOnBoarding(!success)}
      footer={null}
      className={clsx(
        styles.DfOnBoardingModal,
        openState === 'full-on-boarding' && !success && styles.DfOnBoardingModalFull,
      )}
    >
      {currentContent && Component && (
        <Component
          loading={loading}
          success={success}
          setLoading={setLoading}
          setSuccess={setSuccess}
          currentStepIndex={currentStepIndex}
          firstStepOffset={firstStepOffset}
          goToNextStep={goToNextStep}
          onBackClick={onBackClick}
          totalSteps={onBoardingModalStepsOrder.length}
          title={currentContent.title}
          subtitle={currentContent.subtitle}
        />
      )}
    </Modal>
  )
}

function useOnBoardingStepsOrderWithEnergySnapshot() {
  const openState = useOnBoardingModalOpenState()
  const {
    energy: { transactionsCount, status },
  } = useAuth()
  const [energySnapshot, setEnergySnapshot] = useState(0)

  const isWaitingEnergyFetched = useRef(false)
  useEffect(() => {
    if (openState === '') {
      setEnergySnapshot(0)
      isWaitingEnergyFetched.current = false
      return
    }
    const isStubData = transactionsCount === 0 && status === 'normal'
    if (transactionsCount) {
      setEnergySnapshot(transactionsCount)
    } else if (isStubData) {
      isWaitingEnergyFetched.current = true
    }
  }, [openState])
  useEffect(() => {
    if (isWaitingEnergyFetched.current) {
      isWaitingEnergyFetched.current = false
      setEnergySnapshot(transactionsCount)
    }
  }, [transactionsCount, status])

  return useOnBoardingStepsOrder(false, {
    energySnapshot,
  })
}
