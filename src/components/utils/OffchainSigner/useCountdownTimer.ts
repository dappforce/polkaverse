// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
