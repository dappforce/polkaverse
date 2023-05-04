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
