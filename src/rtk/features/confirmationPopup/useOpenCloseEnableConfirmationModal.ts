import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import {
  closeEnableConfirmationModal,
  openEnableConfirmationModal,
} from './enableConfirmationSlice'

export function useEnableConfirmationModalOpenState() {
  return useAppSelector(state => state.enableConfirmation.isOpen)
}

export function useOpenCloseEnableConfirmationModal() {
  const dispatch = useAppDispatch()
  return useCallback((state: 'open' | 'close') => {
    if (state === 'open') {
      dispatch(openEnableConfirmationModal())
    } else {
      dispatch(closeEnableConfirmationModal())
    }
  }, [])
}
