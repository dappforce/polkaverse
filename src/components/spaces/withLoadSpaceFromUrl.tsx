import { isFunction } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useDispatch, useStore } from 'react-redux'
import { useFetchMyPermissionsBySpaceId } from 'src/rtk/features/permissions/mySpacePermissionsHooks'
import { fetchSpace, selectSpace } from 'src/rtk/features/spaces/spacesSlice'
import { DataSourceTypes, SpaceData } from 'src/types'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { getSpaceId } from '../substrate'
import { Loading } from '../utils'

type CheckPermissionResult = {
  ok: boolean
  error: (space: SpaceData) => JSX.Element
}

export type CheckSpacePermissionFn = (space: SpaceData) => CheckPermissionResult

type CheckSpacePermissionProps = {
  checkSpacePermission?: CheckSpacePermissionFn
}

export type CanHaveSpaceProps = {
  space?: SpaceData
}

const log = newLogger('LoadSpaceFromUrl')

export function withLoadSpaceFromUrl<Props extends CanHaveSpaceProps>(
  Component: React.ComponentType<Props>,
) {
  return function (props: Props & CheckSpacePermissionProps): React.ReactElement<Props> {
    const { checkSpacePermission } = props
    const idOrHandle = useRouter().query.spaceId as string

    const [isLoaded, setIsLoaded] = useState(!idOrHandle)
    const [loadedData, setLoadedData] = useState<CanHaveSpaceProps>({})
    useFetchMyPermissionsBySpaceId(loadedData.space?.id)
    const dispatch = useDispatch()
    const store = useStore()

    useSubsocialEffect(
      ({ subsocial }) => {
        let isMounted = true

        const load = async () => {
          const id = await getSpaceId(idOrHandle, subsocial)

          if (isMounted && id) {
            setIsLoaded(false)
            await dispatch(fetchSpace({ api: subsocial, id: id.toString() }))
            let space = selectSpace(store.getState(), { id: id.toString() })

            if (!space) {
              await dispatch(
                fetchSpace({
                  api: subsocial,
                  id: id.toString(),
                  dataSource: DataSourceTypes.CHAIN,
                }),
              )
              space = selectSpace(store.getState(), { id: id.toString() })
            }

            setLoadedData({ space })
          }

          setIsLoaded(true)
        }

        load().catch(err =>
          log.error('Failed to load a space by id or handle from URL:', idOrHandle, err),
        )

        return () => {
          isMounted = false
        }
      },
      [idOrHandle],
    )

    if (!isLoaded) return <Loading label='Loading the space...' />

    const { space } = loadedData

    if (isFunction(checkSpacePermission) && space) {
      const { ok, error } = checkSpacePermission(space)
      if (!ok) return error(space)
    }

    return <Component {...props} space={space} />
  }
}
