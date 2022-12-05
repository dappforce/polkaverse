import { IsFollowSpaceModalUsedProvider } from './IsFollowSpaceModalUsed'
import { IsOnBoardingSkippedProvider } from './IsOnBoardingSkippedContext'
import { ShowOnBoardingSidebarProvider } from './ShowOnBoardingSidebarContext'

export default function OnBoardingContextsWrapper({ children }: { children: any }) {
  return (
    <ShowOnBoardingSidebarProvider>
      <IsOnBoardingSkippedProvider>
        <IsFollowSpaceModalUsedProvider>{children}</IsFollowSpaceModalUsedProvider>
      </IsOnBoardingSkippedProvider>
    </ShowOnBoardingSidebarProvider>
  )
}
