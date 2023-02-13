import { CheckOutlined, ClockCircleOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import isEmpty from 'lodash.isempty'
import { useAuth } from 'src/components/auth/AuthContext'
import { useAppDispatch } from 'src/rtk/app/store'
import { useAllOnBoardingData } from 'src/rtk/features/onBoarding/onBoardingHooks'
import {
  goToStepOnBoardingModal,
  OnBoardingDataTypes,
} from 'src/rtk/features/onBoarding/onBoardingSlice'
import OnBoardingContentContainer from '../../OnBoardingContentContainer'
import { OnBoardingContentProps } from '../../types'
import styles from './Confirmation.module.sass'

const messages: {
  [key in keyof OnBoardingDataTypes]?: (data: OnBoardingDataTypes[key]) => string
} = {
  profile: () => 'Creating your profile',
  topics: data => `Subscribing to ${data.length} topics`,
  spaces: data => `Subscribing to ${data.length} spaces`,
  energy: data => `Burning ${data} SUB`,
  signer: () => 'Remembering you',
}

export default function Confirmation({
  title: _title,
  subtitle: _subtitle,
  ...props
}: OnBoardingContentProps) {
  const onBoardingData = useAllOnBoardingData()
  const dispatch = useAppDispatch()
  const {
    energy: { status },
    balance,
  } = useAuth()

  const noTokenToSign = status === 'zero' && balance.isZero()

  const confirmationContent: JSX.Element[] = []

  Object.keys(messages).forEach(key => {
    const castedKey = key as any as keyof OnBoardingDataTypes
    if (!onBoardingData) return

    const data = onBoardingData[castedKey]
    if (data?.isDraft) return

    const values = data?.values
    const messageGenerator = messages[castedKey] as any
    if (!values || !messageGenerator || (typeof values === 'object' && isEmpty(values))) return

    const Icon = noTokenToSign ? ClockCircleOutlined : CheckOutlined
    confirmationContent.push(
      <div key={key}>
        {noTokenToSign}
        <Icon className={clsx('mr-2', styles.CheckIcon)} />
        <span>{messageGenerator(values)}</span>
      </div>,
    )
  })

  const isOnBoardingSkipped = confirmationContent.length === 0

  let title = _title
  let subtitle = _subtitle
  let buttonText: string | undefined = undefined
  let customButtonOnClick: (() => void) | undefined = undefined
  if (isOnBoardingSkipped) {
    buttonText = 'Finish'
    customButtonOnClick = () => props.goToNextStep({ isSkipped: true })
    title = '🤔 Onboarding skipped'
    subtitle = (
      <span>
        Looks like you skipped the onboarding steps. You can come back to them anytime later or go
        <a className='font-weight-bold' onClick={() => dispatch(goToStepOnBoardingModal('topics'))}>
          {' '}
          back to the beginning{' '}
        </a>
        and go through it now.
      </span>
    )
  } else if (noTokenToSign) {
    title = '🔋 Not enough energy'
    subtitle = (
      <span>
        We see that you have performed the actions listed below, but to sign them you need energy or
        SUB. You can
        <a className='font-weight-bold' onClick={() => dispatch(goToStepOnBoardingModal('energy'))}>
          {' '}
          get energy here
        </a>
      </span>
    )
  }

  return (
    <OnBoardingContentContainer
      disableSubmitBtn={!isOnBoardingSkipped && noTokenToSign}
      title={title}
      subtitle={subtitle}
      customButtonOnClick={customButtonOnClick}
      buttonText={buttonText}
      showPrivacyPolicy
      {...props}
    >
      <div className={clsx(styles.Confirmation)}>
        {isOnBoardingSkipped ? (
          <div className='d-flex justify-content-center mt-3'>
            <img src='/onboarding-skipped.gif' className='on-boarding-image' />
          </div>
        ) : (
          <div className={clsx(styles.ConfirmationContent)}>{confirmationContent}</div>
        )}
      </div>
    </OnBoardingContentContainer>
  )
}
