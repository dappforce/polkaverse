import config from 'src/config'
import { useGetNewsFeeds, useGetNewsFeedsCount } from 'src/graphql/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { selectFeedByAccount } from 'src/rtk/features/posts/myFeedSlice'
import { useMyAddress } from '../auth/MyAccountsContext'
import NotAuthorized from '../auth/NotAuthorized'
import Section from '../utils/Section'
import { createLoadMorePosts, FeedActivities, onchainLoadMorePosts } from './FeedActivities'
import { BaseActivityProps } from './types'

const enableOnchainActivities = config.enableOnchainActivities

const loadingLabel = 'Loading your feed...'

const InnerMyFeed = (props: BaseActivityProps) => {
  const getNewsFeeds = useGetNewsFeeds()
  const offchainLoadMoreFeed = createLoadMorePosts(getNewsFeeds)
  const getNewsFeedsCount = useGetNewsFeedsCount()

  const feedPostIds = useAppSelector(state =>
    enableOnchainActivities ? selectFeedByAccount(state, props.address) : [],
  )

  const loadMoreFn = enableOnchainActivities ? onchainLoadMorePosts : offchainLoadMoreFeed

  return (
    <FeedActivities
      {...props}
      loadMore={loadMoreFn}
      className='DfInfinitePageList'
      loadingLabel={loadingLabel}
      noDataDesc='Your feed is empty. Try to follow more spaces ;)'
      // getCount={getFeedCount}
      totalCount={feedPostIds?.length}
      getCount={enableOnchainActivities ? undefined : getNewsFeedsCount}
      ids={feedPostIds}
    />
  )
}

export const MyFeed = () => {
  const myAddress = useMyAddress()

  if (!myAddress) return <NotAuthorized />

  return (
    <Section>
      <InnerMyFeed address={myAddress} />
    </Section>
  )
}

export default MyFeed
