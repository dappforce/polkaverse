import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { fetchCreators, selectCreators } from './creatorsListSlice'

export function useFetchCreators(config?: { enabled?: boolean }) {
  const { enabled } = config || {}
  const data = useAppSelector(state => selectCreators(state))

  const props = useFetchWithoutApi(fetchCreators, {}, { enabled })

  return {
    ...props,
    data,
  }
}

export function useIsCreatorSpace(spaceId?: string) {
  const { data } = useFetchCreators({ enabled: !!spaceId })
  return data.map(({ spaceId }) => spaceId).includes(spaceId ?? '')
}
