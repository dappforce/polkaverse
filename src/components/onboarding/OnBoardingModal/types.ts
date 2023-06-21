// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { SignerProps } from './steps/Signer/Signer'
export interface OnBoardingModalProps {
  firstStepOffset?: number
  onBackClickInFirstStep?: () => void
}

export interface OnBoardingContentProps {
  title: string | JSX.Element
  subtitle?: string | JSX.Element
  totalSteps?: number

  firstStepOffset: number
  currentStepIndex: number
  goToNextStep: (config?: { forceTerminateFlow?: boolean; isSkipped?: boolean }) => void
  onBackClick: () => void

  loading: boolean
  success: boolean
  setSuccess: (success: boolean) => void
  setLoading: (loading: boolean) => void
}

export interface CustomContinueButtonGroupProps {
  saveAsDraft: () => void
  loading: boolean
  setLoading: (loading: boolean) => void
  isPartial?: boolean
}

export interface OnBoardingContentContainerProps extends OnBoardingContentProps {
  onSubmitValidation?: () => boolean | Promise<boolean>
  disableSubmitBtn?: boolean
  hideSubmitBtn?: boolean
  loadingSubmitBtn?: boolean
  submitTxOnSubmit?: boolean
  children: any
  buttonText?: string
  customButtonOnClick?: () => void
  showPrivacyPolicy?: boolean
  isUsingCustomFooter?: boolean
  signerProps?: SignerProps
}
