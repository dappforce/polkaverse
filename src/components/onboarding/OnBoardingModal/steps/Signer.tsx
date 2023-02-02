import OnBoardingContentContainer from '../OnBoardingContentContainer'
import { OnBoardingContentProps } from '../types'

export default function Signer(props: OnBoardingContentProps) {
  return (
    <OnBoardingContentContainer {...props}>
      <div>
        <p>This is the content</p>
      </div>
    </OnBoardingContentContainer>
  )
}
