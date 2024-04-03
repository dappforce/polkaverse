import { gql } from '@apollo/client'

/**
 * Get total counts of regular posts, comments and spaces.
 * Infinite scoll needs such counts to understand what is a maximum number of items can be fetched.
 */
export const GET_TOTAL_COUNTS = gql`
  query GetHomePageData {
    postCount: postsConnection(where: { kind_eq: RegularPost }, orderBy: id_DESC) {
      totalCount
    }

    spaceCount: spacesConnection(orderBy: id_DESC) {
      totalCount
    }
  }
`

// Fragments
// ------------------------------------------------------------------------------------

export const ACTIVITY_REQUIRED_FRAGMENT = gql`
  fragment ActivityRequiredFragment on Activity {
    account {
      id
    }
    blockNumber
    eventIndex
    event
    date
    aggCount
    aggregated
  }
`

export const PROFILE_SIMPLE_FRAGMENT = gql`
  fragment ProfileSimpleFragment on Account {
    id
    followersCount
    profileSpace {
      id
      profileSpace {
        followingAccountsCount
      }
    }
  }
`

export const SPACE_SIMPLE_FRAGMENT = gql`
  fragment SpaceSimpleFragment on Space {
    canEveryoneCreatePosts
    canFollowerCreatePosts
    content
    createdAtBlock
    createdAtTime
    createdByAccount {
      id
    }
    email
    name
    linksOriginal
    hidden
    id
    updatedAtTime
    experimental
    postsCount
    image
    tagsOriginal
    about
    ownedByAccount {
      id
    }
  }
`

export const POST_SIMPLE_FRAGMENT = gql`
  fragment PostSimpleFragment on Post {
    content
    createdAtBlock
    createdAtTime
    createdByAccount {
      id
    }
    title
    body
    image
    link
    downvotesCount
    hidden
    id
    isComment
    kind
    repliesCount
    sharesCount
    upvotesCount
    updatedAtTime
    canonical
    tagsOriginal
    tweetId
    tweetDetails {
      username
    }
    ownedByAccount {
      id
    }
    space {
      id
    }
    rootPost {
      id
    }
    sharedPost {
      id
    }
  }
`

export const PROFILE_FRAGMENT = gql`
  ${PROFILE_SIMPLE_FRAGMENT}
  ${SPACE_SIMPLE_FRAGMENT}
  fragment ProfileFragment on Account {
    ...ProfileSimpleFragment
    profileSpace {
      ...SpaceSimpleFragment
    }
  }
`

export const SPACE_FRAGMENT = gql`
  ${PROFILE_FRAGMENT}
  ${SPACE_SIMPLE_FRAGMENT}
  fragment SpaceFragment on Space {
    ...SpaceSimpleFragment
    ownedByAccount {
      ...ProfileFragment
    }
  }
`

export const POST_FRAGMENT = gql`
  ${PROFILE_SIMPLE_FRAGMENT}
  ${SPACE_FRAGMENT}
  ${POST_SIMPLE_FRAGMENT}
  fragment PostFragment on Post {
    ...PostSimpleFragment
    ownedByAccount {
      ...ProfileFragment
    }
    space {
      ...SpaceFragment
    }
  }
`

// Post queries
// ------------------------------------------------------------------------------------

export const GET_LATEST_POST_ID = gql`
  query GetLatestPostId {
    posts(limit: 1, orderBy: createdAtTime_DESC) {
      id
    }
  }
`

export const GET_LATEST_POST_IDS = gql`
  query GetLatestPostIds($kinds: [PostKind!] = [RegularPost], $offset: Int = 0, $limit: Int!) {
    posts(
      where: { kind_in: $kinds, space_isNull: false }
      orderBy: createdAtBlock_DESC
      offset: $offset
      limit: $limit
    ) {
      id
    }
  }
`

export const GET_MOST_LIKED_POST_IDS = gql`
  query GetMostLikedPostIds($kind: PostKind = RegularPost, $offset: Int = 0, $limit: Int) {
    posts(
      where: { kind_eq: $kind }
      orderBy: [upvotesCount_DESC, publicRepliesCount_DESC]
      offset: $offset
      limit: $limit
    ) {
      id
    }
  }
`

export const GET_MOST_LIKED_POST_IDS_IN_DATE_RANGE = gql`
  query GetMostLikedPostIdsInDateRange(
    $kind: PostKind = RegularPost
    $offset: Int = 0
    $limit: Int
    $startDate: DateTime
    $endDate: DateTime
  ) {
    posts(
      where: { kind_eq: $kind, createdOnDay_gt: $startDate, createdOnDay_lte: $endDate }
      orderBy: [upvotesCount_DESC, publicRepliesCount_DESC]
      offset: $offset
      limit: $limit
    ) {
      id
    }
  }
`

export const GET_MOST_COMMENTED_POST_IDS = gql`
  query GetMostCommentedPostIds($kind: PostKind = RegularPost, $offset: Int = 0, $limit: Int) {
    posts(
      where: { kind_eq: $kind }
      orderBy: [publicRepliesCount_DESC, upvotesCount_DESC]
      offset: $offset
      limit: $limit
    ) {
      id
    }
  }
`

export const GET_MOST_COMMENTED_POST_IDS_IN_DATE_RANGE = gql`
  query GetMostCommentedPostIdsInDateRange(
    $kind: PostKind = RegularPost
    $offset: Int = 0
    $limit: Int
    $startDate: DateTime
    $endDate: DateTime
  ) {
    posts(
      where: { kind_eq: $kind, createdOnDay_gt: $startDate, createdOnDay_lte: $endDate }
      orderBy: [publicRepliesCount_DESC, upvotesCount_DESC]
      offset: $offset
      limit: $limit
    ) {
      id
    }
  }
`

export const GET_POST_IDS_BY_SPACES = gql`
  query GetPostIdsBySpaces($spaceIds: [String!]!) {
    posts(
      where: { space: { id_in: $spaceIds }, isComment_eq: false }
      orderBy: createdAtTime_DESC
    ) {
      id
    }
  }
`

export const GET_POSTS_DATA = gql`
  ${POST_FRAGMENT}
  query GetPostsData($where: PostWhereInput, $offset: Int, $limit: Int) {
    posts(where: $where, limit: $limit, offset: $offset, orderBy: createdAtTime_DESC) {
      ...PostFragment
      sharedPost {
        ...PostFragment
      }
      parentPost {
        ...PostFragment
      }
    }
  }
`

export const GET_POSTS_COUNT = gql`
  query GetPostsCount($where: PostWhereInput) {
    postsConnection(where: $where, orderBy: id_DESC) {
      totalCount
    }
  }
`

export const GET_POSTS_DATA_WITH_POSTS_COUNT = gql`
  ${POST_FRAGMENT}
  query GetPostsData($where: PostWhereInput, $offset: Int, $limit: Int) {
    posts(where: $where, limit: $limit, offset: $offset) {
      ...PostFragment
      sharedPost {
        ...PostFragment
      }
      parentPost {
        ...PostFragment
      }
    }
  }
`

// Space queries
// ------------------------------------------------------------------------------------

export const GET_LATEST_SPACE_ID = gql`
  query GetLatestSpaceId {
    spaces(limit: 1, orderBy: createdAtTime_DESC) {
      id
    }
  }
`

export const GET_LATEST_SPACE_IDS = gql`
  query GetLatestSpaceIds($offset: Int = 0, $limit: Int!) {
    spaces(offset: $offset, limit: $limit, orderBy: createdOnDay_DESC) {
      id
    }
  }
`

export const GET_MOST_FOLLOWED_SPACE_IDS = gql`
  query GetMostFollowedSpaceIds($offset: Int = 0, $limit: Int!) {
    spaces(
      where: { publicPostsCount_gt: 0 }
      offset: $offset
      limit: $limit
      orderBy: [followersCount_DESC, publicPostsCount_DESC]
    ) {
      id
    }
  }
`

export const GET_MOST_FOLLOWED_SPACE_IDS_IN_DATE_RANGE = gql`
  query GetMostFollowedSpaceIdsInDateRange(
    $offset: Int = 0
    $limit: Int!
    $startDate: DateTime
    $endDate: DateTime
  ) {
    spaces(
      where: { publicPostsCount_gt: 0, createdOnDay_gt: $startDate, createdOnDay_lte: $endDate }
      offset: $offset
      limit: $limit
      orderBy: [followersCount_DESC, publicPostsCount_DESC]
    ) {
      id
    }
  }
`

export const GET_SPACE_IDS_SORTED_BY_POSTS_COUNT = gql`
  query GetSpaceIdsSortedByPostsCount($offset: Int = 0, $limit: Int!) {
    spaces(
      where: { publicPostsCount_gt: 0 }
      offset: $offset
      limit: $limit
      orderBy: [publicPostsCount_DESC, followersCount_DESC]
    ) {
      id
    }
  }
`

export const GET_SPACE_IDS_SORTED_BY_POSTS_COUNT_IN_DATE_RANGE = gql`
  query GetSpaceIdsSortedByPostsCountInDateRange(
    $offset: Int = 0
    $limit: Int!
    $startDate: DateTime
    $endDate: DateTime
  ) {
    spaces(
      where: { publicPostsCount_gt: 0, createdOnDay_gt: $startDate, createdOnDay_lte: $endDate }
      offset: $offset
      limit: $limit
      orderBy: [publicPostsCount_DESC, followersCount_DESC]
    ) {
      id
    }
  }
`

export const GET_SPACES_DATA = gql`
  ${SPACE_FRAGMENT}
  query GetSpacesData($where: SpaceWhereInput) {
    spaces(where: $where) {
      ...SpaceFragment
    }
  }
`

export const GET_PROFILES_COUNT = gql`
  query GetProfilesCount {
    accountsConnection(where: { profileSpace_isNull: false }, orderBy: id_ASC) {
      totalCount
    }
  }
`

export const GET_PROFILES_DATA = gql`
  ${PROFILE_FRAGMENT}
  query GetProfilesData($ids: [String!]) {
    accounts(where: { id_in: $ids }) {
      ...ProfileFragment
    }
  }
`

// Feeds
// ------------------------------------------------------------------------------------

export const GET_NEWS_FEEDS_COUNT = gql`
  query GetNewsFeedsCount($address: String!) {
    newsFeedsConnection(
      orderBy: id_ASC
      where: {
        account: { id_eq: $address }
        activity: {
          account: { id_not_eq: $address }
          post: { isComment_eq: false, space_isNull: false }
        }
      }
    ) {
      totalCount
    }
  }
`

export const GET_NEWS_FEEDS = gql`
  query GetNewsFeeds($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      feeds(
        limit: $limit
        offset: $offset
        orderBy: activity_date_DESC
        where: {
          activity: {
            account: { id_not_eq: $address }
            post: { isComment_eq: false, space_isNull: false }
          }
        }
      ) {
        activity {
          post {
            id
            isComment
          }
        }
      }
    }
  }
`

// Activities
// ------------------------------------------------------------------------------------
export const GET_ACTIVITY_COUNTS = (withHidden?: boolean, spaceId?: string) => gql`
  query GetActivityCounts($address: String!) {
    activities: activitiesConnection(
      orderBy: id_ASC
      where: {
        account: { id_eq: $address }
        event_in: [
          SpaceCreated
          CommentCreated
          CommentShared
          CommentReplyCreated
          CommentReplyShared
          PostCreated
          PostShared
          AccountFollowed
          SpaceFollowed
          AccountUnfollowed
          SpaceUnfollowed
          PostReactionCreated
          PostReactionUpdated
          PostReactionDeleted
          CommentReactionCreated
          CommentReactionUpdated
          CommentReactionDeleted
          CommentReplyReactionCreated
          CommentReplyReactionUpdated
          CommentReplyReactionDeleted
        ]
      }
    ) {
      totalCount
    }
    posts: postsConnection(
      orderBy: id_ASC
      where: { ownedByAccount: { id_eq: $address }, isComment_eq: false, space_isNull: false, 
        ${!withHidden ? 'hidden_eq: false' : ''},
        ${spaceId ? `OR: {space: { id_eq: "${spaceId}" }}` : ''}
      }
    ) {
      totalCount
    }
    tweets: postsConnection(
      orderBy: id_ASC
      where: {
        ownedByAccount: { id_eq: $address }
        tweetId_isNull: false
        isComment_eq: false
        hidden_eq: false
      }
    ) {
      totalCount
    }
    spaces: spacesConnection(orderBy: id_ASC, where: { ownedByAccount: { id_eq: $address } }) {
      totalCount
    }
    comments: postsConnection(
      orderBy: id_ASC
      where: { ownedByAccount: { id_eq: $address }, isComment_eq: true, ${
        !withHidden ? 'hidden_eq: false' : ''
      } }
    ) {
      totalCount
    }
    reactions: activitiesConnection(
      orderBy: id_ASC
      where: {
        account: { id_eq: $address }
        event_in: [
          PostReactionCreated
          PostReactionUpdated
          PostReactionDeleted
          CommentReactionCreated
          CommentReactionUpdated
          CommentReactionDeleted
          CommentReplyReactionCreated
          CommentReplyReactionUpdated
          CommentReplyReactionDeleted
        ]
      }
    ) {
      totalCount
    }
    follows: activitiesConnection(
      orderBy: id_ASC
      where: {
        account: { id_eq: $address }
        event_in: [AccountFollowed, SpaceFollowed, AccountUnfollowed, SpaceUnfollowed]
      }
    ) {
      totalCount
    }
  }
`

export const GET_ALL_ACTIVITY = gql`
  ${ACTIVITY_REQUIRED_FRAGMENT}
  query GetAllActivity($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      activities(
        where: {
          event_in: [
            SpaceCreated
            CommentCreated
            CommentShared
            CommentReplyCreated
            CommentReplyShared
            PostCreated
            PostShared
            AccountFollowed
            SpaceFollowed
            PostReactionCreated
            PostReactionUpdated
            PostReactionDeleted
            CommentReactionCreated
            CommentReactionUpdated
            CommentReactionDeleted
            CommentReplyReactionCreated
            CommentReplyReactionUpdated
            CommentReplyReactionDeleted
          ]
        }
        limit: $limit
        offset: $offset
        orderBy: date_DESC
      ) {
        ...ActivityRequiredFragment
        post {
          id
          isComment
        }
        space {
          id
        }
        followingAccount {
          id
        }
        reaction {
          id
          kind
        }
      }
    }
  }
`

export const GET_FOLLOW_ACTIVITIES = gql`
  ${ACTIVITY_REQUIRED_FRAGMENT}
  query GetFollowActivities($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      activities(
        where: { event_in: [AccountFollowed, SpaceFollowed, AccountUnfollowed, SpaceUnfollowed] }
        limit: $limit
        offset: $offset
        orderBy: date_DESC
      ) {
        ...ActivityRequiredFragment
        space {
          id
        }
        followingAccount {
          id
        }
      }
    }
  }
`

export const GET_REACTION_ACTIVITIES = gql`
  ${ACTIVITY_REQUIRED_FRAGMENT}
  query GetReactionActivities($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      activities(
        where: {
          event_in: [
            PostReactionCreated
            PostReactionUpdated
            PostReactionDeleted
            CommentReactionCreated
            CommentReactionUpdated
            CommentReactionDeleted
            CommentReplyReactionCreated
            CommentReplyReactionUpdated
            CommentReplyReactionDeleted
          ]
        }
        limit: $limit
        offset: $offset
        orderBy: date_DESC
      ) {
        ...ActivityRequiredFragment
        reaction {
          kind
        }
        post {
          isComment
          id
        }
      }
    }
  }
`

export const GET_SPACE_ACTIVITIES = gql`
  query GetSpaceActivities($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      spacesOwned(limit: $limit, offset: $offset, orderBy: createdAtTime_DESC) {
        id
      }
    }
  }
`

export const GET_POST_ACTIVITIES = gql`
  query GetPostActivities($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      posts(
        limit: $limit
        offset: $offset
        orderBy: createdAtTime_DESC
        where: { isComment_eq: false, hidden_eq: false, space_isNull: false }
      ) {
        id
      }
    }
  }
`

export const GET_TWEET_ACTIVITIES = gql`
  query GetTweetActivities($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      posts(
        limit: $limit
        offset: $offset
        orderBy: createdAtTime_DESC
        where: { isComment_eq: false, hidden_eq: false, tweetId_isNull: false }
      ) {
        id
      }
    }
  }
`

export const GET_COMMENT_ACTIVITIES = gql`
  query GetCommentActivities($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      posts(
        limit: $limit
        offset: $offset
        orderBy: createdAtTime_DESC
        where: { isComment_eq: true, hidden_eq: false }
      ) {
        id
      }
    }
  }
`

// Follows
// ------------------------------------------------------------------------------------
export const GET_FOLLOWING_SPACES = gql`
  query GetFollowingSpaces($address: String!) {
    accountById(id: $address) {
      spacesFollowed {
        followingSpace {
          id
        }
      }
    }
  }
`

// Notifications
// ------------------------------------------------------------------------------------

export const GET_NOTIFICATIONS_COUNT = gql`
  query GetNotificationsCount(
    $address: String!
    $afterDate: DateTime = "1970-01-01T00:00:00.000Z"
  ) {
    notificationsConnection(
      orderBy: id_ASC
      where: {
        account: { id_eq: $address }
        activity: { aggregated_eq: true, date_gt: $afterDate, account: { id_not_eq: $address } }
      }
    ) {
      totalCount
    }
  }
`

export const GET_NOTIFICATIONS = gql`
  ${ACTIVITY_REQUIRED_FRAGMENT}
  query GetNotifications($address: String!, $offset: Int = 0, $limit: Int!) {
    notifications(
      where: {
        account: { id_eq: $address }
        activity: { aggregated_eq: true, account: { id_not_eq: $address } }
      }
      limit: $limit
      offset: $offset
      orderBy: activity_date_DESC
    ) {
      id
      activity {
        ...ActivityRequiredFragment
        post {
          id
          isComment
        }
        space {
          id
        }
        followingAccount {
          id
        }
        reaction {
          id
          kind
        }
      }
    }
  }
`

// Reactions
// ------------------------------------------------------------------------------------

export const GET_ADDRESS_POSTS_REACTION = gql`
  query GetAddressPostsReaction($address: String!, $postIds: [String!]!) {
    reactions(
      where: { status_eq: Active, post: { id_in: $postIds }, account: { id_eq: $address } }
    ) {
      id
      kind
      post {
        id
      }
    }
  }
`
// Search
// ------------------------------------------------------------------------------------

export const GET_SEARCH_RESULTS = gql`
  query GetSearchResults(
    $tags: [String!]
    $q: String = ""
    $indexes: [ElasticSearchIndexType!]
    $spaceId: String
    $limit: Int = 50
    $offset: Int = 0
  ) {
    searchQuery(
      q: $q
      indexes: $indexes
      tags: $tags
      spaceId: $spaceId
      limit: $limit
      offset: $offset
    ) {
      hits {
        _content {
          name
          about
          username
          title
          body
          spaceId
          tags
        }
        _id
        _index
      }
    }
  }
`

// Community Highlights
// ------------------------------------------------------------------------------------

export const GET_LASTEST_POST_IDS_IN_SPACE = gql`
  query GetLatestPostIdsInSpace($spaceId: String!, $limit: Int!) {
    posts(limit: $limit, orderBy: createdAtTime_DESC, where: { space: { id_eq: $spaceId } }) {
      id
    }
  }
`
