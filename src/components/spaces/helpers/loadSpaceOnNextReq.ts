import { getSpaceId } from 'src/components/substrate'
import { return404 } from 'src/components/utils/next'
import { NextContextWithRedux } from 'src/rtk/app'
import { fetchSpace, selectSpace } from 'src/rtk/features/spaces/spacesSlice'
import { HasStatusCode, SpaceStruct, SpaceWithSomeDetails } from 'src/types'

export async function loadSpaceOnNextReq(
  props: NextContextWithRedux,
  _: (space: Pick<SpaceStruct, 'id' | 'handle'>) => string,
): Promise<SpaceWithSomeDetails & HasStatusCode> {
  const { context, subsocial, dispatch, reduxStore } = props
  const { query } = context
  const { spaceId } = query
  const idOrHandle = spaceId as string

  try {
    const id = await getSpaceId(idOrHandle, subsocial)

    if (!id) {
      return return404(context)
    }

    const idStr = id.toString()
    await dispatch(fetchSpace({ api: subsocial, id: idStr, reload: true, eagerLoadHandles: true }))
    const spaceData = selectSpace(reduxStore.getState(), { id: idStr })

    if (!spaceData) {
      return return404(context)
    }

    // const maybeHandle = idStr !== idOrHandle ? idOrHandle : undefined

    // const handle = slugifyDomain(maybeHandle)
    // console.log(handle)

    // if (!handle || handle !== idOrHandle) {
    //   const owner = spaceData.struct.ownerId
    //   const handleFromChain = await subsocial.blockchain.domainNameBySpaceId(owner, idStr)

    //   if (handleFromChain) {
    //     const expectedUrl = getCanonicalUrl({ id: idStr, handle: handleFromChain })
    //     if (res) {
    //       res.writeHead(301, { Location: expectedUrl })
    //       res.end()
    //     } else {
    //       router.push(expectedUrl)
    //     }
    //   }
    // }

    return spaceData
  } catch {
    return return404(context)
  }
}
