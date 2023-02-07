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

  loadingProxy?: boolean
  proxyAdded?: boolean
  setProxyAdded?: (proxyAdded: boolean) => void
  setLoadingProxy?: (loadingProxy: boolean) => void
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
  loadingProxy?: boolean
  proxyAdded?: boolean
  setProxyAdded?: (proxyAdded: boolean) => void
  setLoadingProxy?: (loadingProxy: boolean) => void
  onProxyAdded?: () => void
}
