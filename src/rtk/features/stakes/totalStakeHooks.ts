import { useMemo } from 'react'
import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { selectStakeForCreator } from './stakesSlice'
import { fetchTotalStake } from './totalStakeSlice'

export function useTotalStake(address: string) {
  return useAppSelector(state => selectStakeForCreator(state, address))
}

export function useFetchTotalStake(address: string) {
  const data = useTotalStake(address)

  const args = useMemo(() => {
    return { address }
  }, [address])

  const props = useFetchWithoutApi(fetchTotalStake, args, {
    enabled: !!address,
  })

  return {
    ...props,
    data,
  }
}
