import { useSaveOnBoardingData } from 'src/rtk/features/onBoarding/onBoardingHooks'
import OnBoardingContentContainer from '../OnBoardingContentContainer'
import { OnBoardingContentProps } from '../types'

export default function Signer(props: OnBoardingContentProps) {
  const setProxySuccessMessage = useSaveOnBoardingData('signer')

  return (
    <OnBoardingContentContainer
      {...props}
      onProxyAdded={() => setProxySuccessMessage('Remembering you')}
    >
      <div className='d-flex justify-content-center mt-6'>
        <img
          className='on-boarding-confirmationless-image'
          src='/images/onboarding/no-confirm.png'
        />
      </div>
    </OnBoardingContentContainer>
  )
}
