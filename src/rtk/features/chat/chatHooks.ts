import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { setChatConfig, setChatOpen, setTotalMessageCount } from '../chat/chatSlice'

export function useSetChatTotalMessageCount() {
  const dispatch = useAppDispatch()
  return useCallback((...params: Parameters<typeof setTotalMessageCount>) => {
    dispatch(setTotalMessageCount(...params))
  }, [])
}

export function useSetChatEntityConfig() {
  const dispatch = useAppDispatch()
  return useCallback((...params: Parameters<typeof setChatConfig>) => {
    dispatch(setChatConfig(...params))
  }, [])
}

export function useSetChatOpen() {
  const dispatch = useAppDispatch()
  const setIsOpen = useCallback((isOpen: boolean) => {
    dispatch(setChatOpen(isOpen))
  }, [])
  return setIsOpen
}

export function useChatOpenState() {
  const isOpen = useAppSelector(state => state.chat.isOpen)
  const setIsOpen = useSetChatOpen()

  return [isOpen, setIsOpen] as const
}
