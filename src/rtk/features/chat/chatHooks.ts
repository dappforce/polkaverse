import { PostData } from '@subsocial/api/types'
import { useCallback } from 'react'
import { useAppDispatch } from 'src/rtk/app/store'
import { setChatConfig } from '../chat/chatSlice'

export function useSetupGrillConfig() {
  const dispatch = useAppDispatch()
  return useCallback((post: PostData) => {
    // const title = summarize(post.content?.title ?? post.content?.body ?? '', { limit: 50 })
    // const config: GrillConfig = {
    //   hub: {
    //     id: post.struct.spaceId ?? 'x',
    //   },
    //   channel: {
    //     type: 'resource',
    //     resource: new Resource({
    //       schema: 'social',
    //       app: 'polkaverse',
    //       resourceType: 'post',
    //       resourceValue: {
    //         id: post.struct.id,
    //       },
    //     }),
    //     settings: {
    //       enableLoginButton: true,
    //       enableInputAutofocus: true,
    //     },
    //     metadata: {
    //       title,
    //       body: post.content?.body,
    //       image: post.content?.image,
    //     },
    //   },
    // }
    dispatch(setChatConfig({ type: 'post', data: post }))
  }, [])
}
