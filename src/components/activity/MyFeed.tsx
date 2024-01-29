import config from 'src/config'
import { useGetNewsFeeds, useGetNewsFeedsCount } from 'src/graphql/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { selectFeedByAccount } from 'src/rtk/features/posts/myFeedSlice'
import { useMyAddress } from '../auth/MyAccountsContext'
import NotAuthorized from '../auth/NotAuthorized'
import WriteSomething from '../posts/WriteSomething'
import Section from '../utils/Section'
import { createLoadMorePosts, FeedActivities, onchainLoadMorePosts } from './FeedActivities'
import { BaseActivityProps, LoadMoreProps } from './types'

const enableOnchainActivities = config.enableOnchainActivities

const loadingLabel = 'Loading your feed...'

const sessionPageAndDataMap: Map<
  string,
  { initialPage: number; dataSource: Record<number, string[]> }
> = new Map()
const getSessionKey = ({ address }: { address: string | undefined }) => address ?? ''
const InnerMyFeed = (props: BaseActivityProps) => {
  const { address } = props
  const getNewsFeeds = useGetNewsFeeds()
  const offchainLoadMoreFeed = createLoadMorePosts(getNewsFeeds)
  const getNewsFeedsCount = useGetNewsFeedsCount()

  const feedPostIds = useAppSelector(state =>
    enableOnchainActivities ? selectFeedByAccount(state, address) : [],
  )

  const currentSessionKey = getSessionKey({ address })
  const loadMoreFn = enableOnchainActivities ? onchainLoadMorePosts : offchainLoadMoreFeed
  const augmentedLoadMoreFn = async (props: LoadMoreProps) => {
    const res = await loadMoreFn(props)
    let { dataSource } = sessionPageAndDataMap.get(currentSessionKey) || {}
    if (!dataSource) dataSource = {}
    dataSource[props.page] = res

    sessionPageAndDataMap.set(currentSessionKey, {
      initialPage: props.page + 1,
      dataSource,
    })
    return res
  }

  const currentSessionData = sessionPageAndDataMap.get(currentSessionKey)

  return (
    <FeedActivities
      {...props}
      loadMore={augmentedLoadMoreFn}
      className='DfInfinitePageList'
      loadingLabel={loadingLabel}
      noDataDesc='Your feed is empty. Try to follow more spaces ;)'
      initialPage={currentSessionData?.initialPage}
      dataSource={Object.values(currentSessionData?.dataSource || {}).flat()}
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
      <WriteSomething className='mt-3' />
      <InnerMyFeed address={myAddress} />
    </Section>
  )
}

export default MyFeed
