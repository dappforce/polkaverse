import { useMemo } from 'react'
import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { fetchStakeData, getStakeId, selectStakeForCreator } from './stakesSlice'

export function useStakeData(address: string, creatorSpaceId: string) {
  return useAppSelector(state =>
    selectStakeForCreator(state, getStakeId({ address, creatorSpaceId })),
  )
}

export function useFetchStakeData(address: string, creatorSpaceId: string) {
  const data = useStakeData(address, creatorSpaceId)

  const args = useMemo(() => {
    return { address, creatorSpaceId }
  }, [address, creatorSpaceId])

  const props = useFetchWithoutApi(fetchStakeData, args, { enabled: !!address && !!creatorSpaceId })

  return {
    ...props,
    data,
  }
}
