import { Button } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import RememberMeButton from 'src/components/utils/OffchainSigner/RememberMeButton'
import { useSaveOnBoardingData } from 'src/rtk/features/onBoarding/onBoardingHooks'
import OnBoardingContentContainer from '../OnBoardingContentContainer'
import { OnBoardingContentProps } from '../types'

export default function Signer(props: OnBoardingContentProps) {
  const setProxySuccessMessage = useSaveOnBoardingData('signer')

  const [loadingProxy, setLoadingProxy] = useState(false)
  const [proxyAdded, setProxyAdded] = useState(false)
  const [offchainSigner, setOffchainSigner] = useState(false)

  const handleProxySuccessMessage = () => {
    setProxySuccessMessage('Remembering you')
  }

  return (
    <OnBoardingContentContainer
      {...props}
      customContinueButtonGroup={saveAsDraft => (
        <div className={clsx('d-flex justify-center align-center GapNormal')}>
          <Button
            className={clsx('w-100')}
            size='large'
            onClick={() => {
              props.goToNextStep()
            }}
          >
            No, I’m fine
          </Button>
          <RememberMeButton
            className={clsx('w-100')}
            type='primary'
            size='large'
            withSpinner={true}
            loading={loadingProxy}
            disabled={loadingProxy}
            onClick={() => {
              setLoadingProxy(true)

              saveAsDraft()
              if (proxyAdded && offchainSigner) {
                props.goToNextStep()
              } else {
                setLoadingProxy(false)
              }
            }}
            onFailedAuth={() => setLoadingProxy(false)}
            onSuccessAuth={() => {
              setLoadingProxy(false)
              setProxyAdded(true)
              setOffchainSigner(true)
              handleProxySuccessMessage()
              props.goToNextStep()
            }}
          />
        </div>
      )}
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
