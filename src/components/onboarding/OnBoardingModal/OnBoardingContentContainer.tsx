import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import clsx from 'clsx'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { subsocialUrl } from 'src/components/urls'
import LoadingTransaction from 'src/components/utils/LoadingTransaction'
import { MutedDiv, MutedSpan } from 'src/components/utils/MutedText'
import PrivacyPolicyText from 'src/components/utils/PrivacyPolicyText'
import TwitterMock from 'src/components/utils/TwitterMock'
import TxButton from 'src/components/utils/TxButton'
import config from 'src/config'
import { useAppDispatch } from 'src/rtk/app/store'
import {
  useCurrentOnBoardingStep,
  useOnBoardingBatchTxs,
  useOnBoardingModalOpenState,
} from 'src/rtk/features/onBoarding/onBoardingHooks'
import {
  markStepAsDraftOnBoardingModal,
  resetOnBoardingData,
} from 'src/rtk/features/onBoarding/onBoardingSlice'
import styles from './OnBoardingModal.module.sass'
import { OnBoardingContentContainerProps } from './types'

export default function OnBoardingContentContainer({
  title,
  subtitle,
  children,
  disableSubmitBtn,
  onSubmitValidation,
  totalSteps = 1,
  currentStepIndex,
  firstStepOffset,
  goToNextStep,
  onBackClick,
  loading,
  success,
  setLoading,
  setSuccess,
  buttonText = 'Continue',
  customButtonOnClick,
  hideSubmitBtn,
  loadingSubmitBtn,
  showPrivacyPolicy,
  customContinueButtonGroup,
}: OnBoardingContentContainerProps) {
  const openState = useOnBoardingModalOpenState()
  const currentStep = useCurrentOnBoardingStep()
  const dispatch = useAppDispatch()

  const isLastStep = totalSteps - 1 <= (currentStepIndex ?? -1)

  const shouldSubmitTxWhenContinue = isLastStep || openState === 'partial'

  const ContinueBtn = shouldSubmitTxWhenContinue && !customButtonOnClick ? TxButton : Button
  const getBatchParams = useOnBoardingBatchTxs(openState === 'partial' ? currentStep : undefined)

  if (loading) {
    title = '🕔 Please wait'
    subtitle = 'We are recording your information on the blockchain.'
  } else if (success) {
    title = "🎉 You're all set"
    subtitle = 'Your profile is ready to use, and you can edit it at any time.'
  }

  const showContinueBtn = !loading && !success && !hideSubmitBtn && currentStep !== 'signer'

  return (
    <>
      {openState === 'full-on-boarding' && !success && (
        <div className={clsx('d-flex justify-content-between mb-3')}>
          <MutedDiv className={clsx('d-flex align-items-center')}>
            <ArrowLeftOutlined
              className='mr-2'
              onClick={
                loading
                  ? undefined
                  : () => {
                      onBackClick()
                    }
              }
            />
            <span className='font-weight-bold'>
              Step {currentStepIndex + firstStepOffset}/{totalSteps - 1 + firstStepOffset}
            </span>
          </MutedDiv>
          <Button
            type='link'
            className='px-0 font-weight-bold'
            disabled={loading}
            onClick={() => {
              dispatch(markStepAsDraftOnBoardingModal(true))
              goToNextStep({ isSkipped: true })
            }}
          >
            <MutedDiv>Skip</MutedDiv>
          </Button>
        </div>
      )}
      <div className={clsx('mb-3 mr-4', success && 'text-center')}>
        <h2 className={styles.Title}>{title}</h2>
        <MutedSpan>{subtitle}</MutedSpan>
      </div>
      <div
        className={clsx(
          styles.ContentContainer,
          !success && 'overflow-auto',
          openState === 'full-on-boarding' && styles.ContentContainerFull,
          'scrollbar',
        )}
      >
        <ContentWrapper loading={loading} success={success}>
          {children}
        </ContentWrapper>
      </div>
      <div className='mt-auto'>
        {showContinueBtn && showPrivacyPolicy && (
          <MutedDiv className='mt-2'>
            <PrivacyPolicyText
              className='FontSmall'
              textGenerator={({ privacy, terms }) => (
                <span>
                  By clicking Continue, you agree to our {terms} and that you have read our{' '}
                  {privacy}.
                </span>
              )}
            />
          </MutedDiv>
        )}

        {customContinueButtonGroup &&
          customContinueButtonGroup(() => {
            dispatch(markStepAsDraftOnBoardingModal(true))
          })}

        {showContinueBtn && (
          <ContinueBtn
            isFreeTx
            type='primary'
            block
            size='large'
            className='mt-4'
            tx='utility.batch'
            onSuccess={() => {
              setLoading(false)
              if (openState === 'partial') {
                goToNextStep({ forceTerminateFlow: true })
                dispatch(resetOnBoardingData(currentStep))
                return
              }
              setSuccess(true)
            }}
            params={getBatchParams}
            onFailed={() => setLoading(false)}
            loading={loadingSubmitBtn}
            disabled={disableSubmitBtn}
            onValidate={async () => {
              if (onSubmitValidation) {
                const isValid = await onSubmitValidation()
                if (!isValid) return false
              }
              return true
            }}
            onClick={async () => {
              if (customButtonOnClick) {
                customButtonOnClick()
                return
              }
              if (onSubmitValidation) {
                const isValid = await onSubmitValidation()
                if (!isValid) return
              }
              dispatch(markStepAsDraftOnBoardingModal(false))
              if (!shouldSubmitTxWhenContinue) {
                goToNextStep()
              } else {
                setLoading(true)
              }
            }}
          >
            {buttonText}
          </ContinueBtn>
        )}
      </div>
    </>
  )
}

function ContentWrapper({
  success,
  loading,
  children,
}: {
  success: boolean
  loading: boolean
  children: any
}) {
  if (success) return <SuccessContent />
  else if (loading) return <LoadingTransaction />
  return children
}

function SuccessContent() {
  const myAddress = useMyAddress()
  const twitterText = `I just onboarded to ${config.appName}, the premier social platform of the @Polkadot ecosystem, powered by @SubsocialChain!\n\nYou can follow me here:`

  return (
    <div className={clsx('d-flex flex-column', 'position-relative')}>
      <div
        className='position-absolute inset-0 w-100 h-100'
        style={{
          zIndex: 1,
          backgroundImage: `url(/confetti.gif?d=${Date.now()})`,
          backgroundSize: 'cover',
          transform: 'translateY(-60%)',
          pointerEvents: 'none',
        }}
      />
      <TwitterMock
        url={`/accounts/${myAddress}`}
        twitterText={twitterText}
        buttonText='Tweet about it!'
      >
        <p>
          I just onboarded to {config.appName}, the premier social platform of the @Polkadot
          ecosystem, powered by @SubsocialChain!
          <br />
          <br />
          You can follow me here:
          <br />
          <a>{subsocialUrl(`/accounts/${myAddress}`)}</a>
        </p>
        <a>#{config.appName} #Subsocial</a>
      </TwitterMock>
    </div>
  )
}
