// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
