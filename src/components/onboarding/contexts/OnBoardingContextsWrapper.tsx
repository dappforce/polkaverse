// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { IsFollowSpaceModalUsedProvider } from './IsFollowSpaceModalUsed'
import { IsOnBoardingSkippedProvider } from './IsOnBoardingSkippedContext'
import { IsProxyAddedProvider } from './IsProxyAdded'
import { ShowOnBoardingSidebarProvider } from './ShowOnBoardingSidebarContext'

export default function OnBoardingContextsWrapper({ children }: { children: any }) {
  return (
    <ShowOnBoardingSidebarProvider>
      <IsOnBoardingSkippedProvider>
        <IsProxyAddedProvider>
          <IsFollowSpaceModalUsedProvider>{children}</IsFollowSpaceModalUsedProvider>
        </IsProxyAddedProvider>
      </IsOnBoardingSkippedProvider>
    </ShowOnBoardingSidebarProvider>
  )
}
