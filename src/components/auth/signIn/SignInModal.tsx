import React, { useState } from 'react'

import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import Modal from 'antd/lib/modal'
import clsx from 'clsx'
import config from 'src/config'
import { AccountSelector } from '../../profile-selector/AccountSelector'
import { useResponsiveSize } from '../../responsive/ResponsiveContext'
import ExternalLink from '../../spaces/helpers/ExternalLink'
import { MutedDiv } from '../../utils/MutedText'
import PrivacyPolicyLinks from '../../utils/PrivacyPolicyLinks'
import WalletList from '../../wallets/wallet-list/WalletsList'
import { CompletedSteps, StepsEnum, useAuth } from '../AuthContext'
import { useMyAccountsContext } from '../MyAccountsContext'
import ConfirmationModalContent from './email/ConfirmationModalContent'
import ShowMnemonicModalContent from './email/ShowMnemonicModalContent'
import SignInEmailButton from './email/SignInEmailButton'
import SignInModalContent from './email/SignInModalContent'
import SignUpModalContent from './email/SignUpModalContent'
import styles from './SignInModal.module.sass'

const { mobileAppLogo } = config

type ModalProps = {
  open: boolean
  hide: () => void
}

type ModalTitleProp = {
  setCurrentStep: (step: number) => void
  currentStep: number
  withBackButton?: boolean
}

const ModalTitle = ({ setCurrentStep, currentStep, withBackButton }: ModalTitleProp) => {
  const { isMobile } = useResponsiveSize()
  const isShowBackButton = currentStep !== StepsEnum.SelectWallet

  const onBackButtonClick = () => {
    if (currentStep === StepsEnum.SignIn) {
      setCurrentStep(StepsEnum.SelectWallet)
      return
    }
    if (currentStep === StepsEnum.Confirmation) {
      setCurrentStep(StepsEnum.SignIn)
      return
    }
    currentStep !== -1 && setCurrentStep(currentStep - 1)
  }

  return (
    <>
      <div className={styles.BackButton}>
        {isShowBackButton && !isMobile && withBackButton && (
          <MutedDiv className={clsx('d-flex align-items-center')}>
            <ArrowLeftOutlined className='mr-2' onClick={onBackButtonClick} />
            <span className='font-weight-bold'>Back</span>
          </MutedDiv>
        )}
      </div>
      <div className='d-flex align-items-center justify-content-center pr-2 pl-2'>
        <img className={clsx(styles.ModalLogo)} src={mobileAppLogo} alt='SubId' />
        <div></div>
      </div>
    </>
  )
}

const ModalFooter = () => {
  return <PrivacyPolicyLinks className={styles.ModalFooter} />
}

type ModalBodyWrapperProps = {
  children?: React.ReactNode
  moreDesc?: React.ReactNode
  title: React.ReactNode
  desc: React.ReactNode
}

const ExpandableDescription = (props: ModalBodyWrapperProps) => {
  const { children, title, desc, moreDesc } = props

  const [isExpanded, setExpanded] = useState(false)

  if (isExpanded)
    return (
      <div>
        <div className={styles.BodyTitle}>
          <h2 className='font-weight-bold'>{title}</h2>
          <MutedDiv>
            {desc} {moreDesc}{' '}
            <span className={styles.ReadMore} onClick={() => setExpanded(false)}>
              Read less
            </span>
          </MutedDiv>
        </div>
        {children}
      </div>
    )

  return (
    <div>
      <div className={styles.BodyTitle}>
        <h2 className='font-weight-bold'>{title}</h2>
        <MutedDiv>
          {desc}{' '}
          <span className={styles.ReadMore} onClick={() => setExpanded(true)}>
            Read more
          </span>
        </MutedDiv>
      </div>
      {children}
    </div>
  )
}

const ModalBodyWrapper = ({ children, moreDesc, title, desc }: ModalBodyWrapperProps) => {
  if (moreDesc) return <ExpandableDescription {...{ children, moreDesc, title, desc }} />

  return (
    <div>
      <div className={styles.BodyTitle}>
        <h2 className='font-weight-bold'>{title}</h2>
        <MutedDiv>{desc}</MutedDiv>
      </div>
      {children}
    </div>
  )
}

type AdditionalModalProps = {
  onAccountChosen: (address: string) => void
}

export type SignInModalProps = AdditionalModalProps & ModalProps

type GetModalContentProps = {
  completedSteps: CompletedSteps
  currentStep: number
  setCurrentStep: (step: number) => void
  hideSignInModal: () => void
} & AdditionalModalProps

const ModalContent = ({
  currentStep,
  setCurrentStep,
  hideSignInModal,
  onAccountChosen,
}: GetModalContentProps) => {
  const { setAddress } = useMyAccountsContext()

  const onAuthSuccess = (address: string) => {
    hideSignInModal()
    setAddress(address)
    setCurrentStep(StepsEnum.SelectWallet)
    onAccountChosen?.(address)
  }

  const onAccountClick = (address: string) => {
    hideSignInModal()
    onAccountChosen?.(address)
  }

  switch (currentStep) {
    case StepsEnum.SelectWallet: {
      return (
        <div>
          <ModalBodyWrapper
            title='Sign In'
            desc={
              <>
                Choose one of the available wallet providers to connect to {config.appName}, or sign
                in with your email address.{' '}
                <ExternalLink
                  url='https://docs.subsocial.network/docs/tutorials/#polkadotjs'
                  value='How do I set up a wallet?'
                />
              </>
            }
          >
            <SignInEmailButton setCurrentStep={setCurrentStep} />

            <div className={styles.Divider}>
              <h2>
                <span>Or connect wallet</span>
              </h2>
            </div>

            <WalletList setCurrentStep={setCurrentStep} />
          </ModalBodyWrapper>
        </div>
      )
    }
    case StepsEnum.SelectAccount: {
      return (
        <div>
          <ModalBodyWrapper title='Select your account' desc='Click on your account to Sign In'>
            <AccountSelector
              withCurrentAccount={false}
              overviewCurrentAccount
              onItemClick={onAccountClick}
            />
          </ModalBodyWrapper>
        </div>
      )
    }

    case StepsEnum.SignIn: {
      return (
        <div>
          <ModalBodyWrapper title={'Sign in with email'} desc={''}>
            <SignInModalContent setCurrentStep={setCurrentStep} onSignInSuccess={onAuthSuccess} />
          </ModalBodyWrapper>
        </div>
      )
    }

    case StepsEnum.SignUp: {
      return (
        <div>
          <ModalBodyWrapper title={'Create account with email'} desc={''}>
            <SignUpModalContent setCurrentStep={setCurrentStep} />
          </ModalBodyWrapper>
        </div>
      )
    }

    case StepsEnum.Confirmation: {
      return (
        <div>
          <ModalBodyWrapper
            title={'Email confirmation'}
            desc={
              'We have just sent a confirmation code to your email, please enter it in the field below'
            }
          >
            <ConfirmationModalContent setCurrentStep={setCurrentStep} />
          </ModalBodyWrapper>
        </div>
      )
    }

    case StepsEnum.ShowMnemonic: {
      return (
        <div>
          <ModalBodyWrapper
            title={'Mnemonic phrase'}
            desc={
              'Write down and copy these words in the correct order and save them somewhere safe.'
            }
            moreDesc={
              'Your mnemonic phrase will allow you to recover your account, and is encrypted by your password and stored locally in your browser; nobody else can access it.'
            }
          >
            <ShowMnemonicModalContent onRegisterDone={onAuthSuccess} />
          </ModalBodyWrapper>
        </div>
      )
    }

    default:
      return null
  }
}

export const SignInModalView = ({ open, hide, onAccountChosen }: SignInModalProps) => {
  const {
    state: { completedSteps, currentStep },
    setCurrentStep,
    hideSignInModal,
    withBackButton,
  } = useAuth()

  const withSkipButton = currentStep === StepsEnum.ShowMnemonic
  const isAbleToGoBack = currentStep !== StepsEnum.Confirmation

  return (
    <Modal
      visible={open}
      title={
        <div className={styles.TitleContainer}>
          <ModalTitle
            setCurrentStep={setCurrentStep}
            currentStep={currentStep}
            withBackButton={isAbleToGoBack && withBackButton}
          />
        </div>
      }
      footer={
        currentStep !== StepsEnum.Confirmation &&
        currentStep !== StepsEnum.ShowMnemonic && <ModalFooter />
      }
      className={clsx('DfSignInModal', {
        [styles.SignInModal]:
          currentStep !== StepsEnum.SelectAccount && currentStep !== StepsEnum.SelectWallet,
      })}
      onCancel={hide}
      destroyOnClose
      closeIcon={
        withSkipButton && (
          <Button type='link' className='px-0 mr-4 font-weight-bold' onClick={hideSignInModal}>
            <MutedDiv>Skip</MutedDiv>
          </Button>
        )
      }
    >
      <div
        className={clsx(styles.SignInModalBody, {
          [styles.SignInModalBodyOnConfirm]:
            currentStep === StepsEnum.Confirmation || currentStep === StepsEnum.ShowMnemonic,
        })}
      >
        <ModalContent
          onAccountChosen={onAccountChosen}
          completedSteps={completedSteps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          hideSignInModal={hideSignInModal}
        />
      </div>
    </Modal>
  )
}

export const SignInModal = (props: SignInModalProps) => <SignInModalView {...props} />

export default SignInModal
