// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React, { createContext, useContext } from 'react'

type Storybook = {
  isStorybook: boolean
}

export const StorybookContext = createContext<Storybook>({ isStorybook: false })

export const useStorybookContext = () => useContext(StorybookContext)

export const StorybookProvider = (props: React.PropsWithChildren<{}>) => {
  return (
    <StorybookContext.Provider value={{ isStorybook: true }}>
      {props.children}
    </StorybookContext.Provider>
  )
}
