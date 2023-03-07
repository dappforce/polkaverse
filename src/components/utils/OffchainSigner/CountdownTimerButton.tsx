import { Button, ButtonProps } from 'antd'
import { useState } from 'react'
import useCountdownTimer from './useCountdownTimer'

interface BaseButtonProps extends ButtonProps {
  baseLabel?: React.ReactNode
  className?: string
  type?: 'text' | 'link' | 'ghost' | 'default' | 'primary' | 'dashed' | undefined
}

const CountdownTimerButton = ({ className, baseLabel, type }: BaseButtonProps) => {
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false)
  const remainingSeconds: number = useCountdownTimer(60, isCountingDown) // countdown from 60 seconds

  const handleButtonClick = (): void => {
    setIsCountingDown(true)
  }

  let buttonLabel = baseLabel
  if (isCountingDown) {
    buttonLabel = remainingSeconds === 0 ? baseLabel : `${baseLabel} in ${remainingSeconds} seconds`

    if (remainingSeconds === 0) {
      setIsCountingDown(false)
    }
  }

  const BaseButton = (props: BaseButtonProps) => {
    return (
      <Button className={className} type={type} {...props}>
        {buttonLabel}
      </Button>
    )
  }

  return (
    <div>
      {isCountingDown ? (
        <BaseButton disabled>{buttonLabel}</BaseButton>
      ) : (
        <BaseButton onClick={handleButtonClick}>{buttonLabel}</BaseButton>
      )}
    </div>
  )
}

export default CountdownTimerButton
