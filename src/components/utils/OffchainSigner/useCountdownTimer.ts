import { useEffect, useState } from 'react'

const useCountdownTimer = (initialSeconds: number, isCountingDown: boolean) => {
  const [seconds, setSeconds] = useState<number>(initialSeconds)
  const [initialSecondsState] = useState<number>(initialSeconds)

  useEffect(() => {
    if (isCountingDown) {
      setSeconds(initialSecondsState)
    }
  }, [isCountingDown, initialSecondsState])

  useEffect(() => {
    let interval: NodeJS.Timer
    if (isCountingDown) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            clearInterval(interval)
          }
          return prevSeconds - 1
        })
      }, 1000)
    } else {
      setSeconds(initialSecondsState)
    }
    return () => clearInterval(interval)
  }, [isCountingDown, initialSecondsState])

  return seconds
}

export default useCountdownTimer
