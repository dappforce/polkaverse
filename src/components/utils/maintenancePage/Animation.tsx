import Lottie, { LottieProps } from 'react-lottie'
import MaintenanceAnimationIcon from './MaintenanceAnimation.json'

export type MaintenanceAnimationProps = Omit<LottieProps, 'options'>

export default function MaintenanceAnimation(props: MaintenanceAnimationProps) {
  const defaultOptions: LottieProps = {
    ...props,
    options: {
      loop: true,
      autoplay: true,
      animationData: MaintenanceAnimationIcon,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
      },
    },
  }

  return <Lottie {...defaultOptions} height={props.height || 250} width={props.width || 250} />
}
