import grill, { GrillConfig } from '@subsocial/grill-widget'
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { setChatWindowVisibility, setCurrentConfig } from '../chat/chatSlice'

export function useChatWindowOpenState() {
  return useAppSelector(state => state.chat.isChatWindowOpen)
}

export function useSetupGrillConfig() {
  const dispatch = useAppDispatch()
  return useCallback((spaceId: string, postId: string, title?: string) => {
    const config: GrillConfig = {
      hub: {
        id: spaceId,
      },
      channel: {
        type: 'resource',
        resource: {
          toResourceId: () => postId,
        },
        settings: {
          enableLoginButton: false,
          enableInputAutofocus: true,
        },
        metadata: {
          title: title ?? '',
        },
      },
    }
    grill.init(config)
    dispatch(setCurrentConfig(config))
  }, [])
}

export function useOpenCloseChatWindow() {
  const dispatch = useAppDispatch()
  return useCallback((state: boolean) => {
    dispatch(setChatWindowVisibility(state))
  }, [])
}
