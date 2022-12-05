import { Tabs } from 'antd'
import { useAppSelector } from 'src/rtk/app/store'
import { selectPostIdsByOwner } from 'src/rtk/features/posts/ownPostIdsSlice'
import { selectSpaceIdsByOwner } from 'src/rtk/features/spaceIds/ownSpaceIdsSlice'
import { Loading } from '../utils'
import { FeedActivities, onchainLoadMorePosts } from './FeedActivities'
import { SpaceActivities } from './SpaceActivities'
import { BaseActivityProps } from './types'

const { TabPane } = Tabs

type ActivitiesByAddressProps = {
  address: string
}

const PostActivities = (props: BaseActivityProps) => (
  <FeedActivities
    {...props}
    loadMore={onchainLoadMorePosts}
    noDataDesc='No posts yet'
    loadingLabel='Loading posts...'
  />
)

export const OnchainAccountActivity = ({ address }: ActivitiesByAddressProps) => {
  const myPostIds = useAppSelector(state => selectPostIdsByOwner(state, address))
  const mySpaceIds = useAppSelector(state => selectSpaceIdsByOwner(state, address))

  if (!myPostIds) return <Loading label='Loading activities...' />

  const postsCount = myPostIds?.length || 0
  const spacesCount = mySpaceIds?.length || 0
  const getTabTitle = (title: string, count: number) => `${title} (${count})`

  return (
    <Tabs>
      <TabPane tab={getTabTitle('Posts', postsCount)} key='posts'>
        <PostActivities address={address} totalCount={postsCount} ids={myPostIds} />
      </TabPane>
      <TabPane tab={getTabTitle('Spaces', spacesCount)} key='spaces'>
        <SpaceActivities address={address} totalCount={spacesCount} ids={mySpaceIds} />
      </TabPane>
    </Tabs>
  )
}
