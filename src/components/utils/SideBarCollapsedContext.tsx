// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { newLogger } from '@subsocial/utils'
import React, { createContext, useContext, useEffect, useReducer } from 'react'
import useIsPostPage from 'src/hooks/useIsPostPage'
import store from 'store'
import { isHomePage } from '.'
import { useResponsiveSize } from '../responsive'
const log = newLogger('Sidebar collapsed context')

export const SIDEBAR_COLLAPSED = 'df.colapsed'

type SidebarCollapsedState = {
  inited: boolean
  collapsed?: boolean
  asDrawer?: boolean
}

type SidebarCollapsedAction = {
  type: 'reload' | 'set'
  collapsed?: boolean
}

function reducer(
  state: SidebarCollapsedState,
  action: SidebarCollapsedAction,
): SidebarCollapsedState {
  let collapsed: boolean | undefined

  switch (action.type) {
    case 'reload':
      collapsed = (isHomePage() && store.get(SIDEBAR_COLLAPSED)) || true
      log.debug('Reload collapsed:', collapsed)
      return { ...state, collapsed, inited: true }

    case 'set':
      collapsed = action.collapsed
      if (collapsed !== state.collapsed) {
        log.debug('Set new collapsed:', collapsed)
        store.set(SIDEBAR_COLLAPSED, collapsed)
        return { ...state, collapsed, inited: true }
      }
      return state

    default:
      throw new Error('No action type provided')
  }
}

function functionStub() {
  throw new Error('Function needs to be set in SidebarCollapsedProvider')
}

const initialState = {
  inited: false,
  asDrawer: false,
  collapsed: undefined,
}

export type SidebarCollapsedContextProps = {
  state: SidebarCollapsedState
  dispatch: React.Dispatch<SidebarCollapsedAction>
  hide: () => void
  show: () => void
  toggle: () => void
}

const contextStub: SidebarCollapsedContextProps = {
  state: initialState,
  dispatch: functionStub,
  hide: functionStub,
  show: functionStub,
  toggle: functionStub,
}

export const SidebarCollapsedContext = createContext<SidebarCollapsedContextProps>(contextStub)

export function SidebarCollapsedProvider(props: React.PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { isDesktop } = useResponsiveSize()
  const isPostPage = useIsPostPage()

  const asDrawer = !isDesktop || isPostPage

  useEffect(() => {
    if (!state.inited) {
      dispatch({ type: 'reload' })
    }
  }, [state.inited]) // Don't call this effect if `invited` is not changed

  const contextValue = {
    state: { ...state, asDrawer },
    dispatch,
    hide: () => dispatch({ type: 'set', collapsed: true }),
    show: () => dispatch({ type: 'set', collapsed: false }),
    toggle: () => dispatch({ type: 'set', collapsed: !state.collapsed }),
  }

  return (
    <SidebarCollapsedContext.Provider value={contextValue}>
      {props.children}
    </SidebarCollapsedContext.Provider>
  )
}

export function useSidebarCollapsed() {
  return useContext(SidebarCollapsedContext)
}

export default SidebarCollapsedProvider
