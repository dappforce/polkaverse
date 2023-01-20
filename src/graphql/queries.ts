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

export const GET_LATEST_POST_IDS = gql`
  query GetLatestPostIds($kind: PostKind = RegularPost, $offset: Int = 0, $limit: Int!) {
    posts(where: { kind_eq: $kind }, orderBy: createdAtBlock_DESC, offset: $offset, limit: $limit) {
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
  query GetPostsData($where: PostWhereInput) {
    posts(where: $where) {
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

export const GET_LATEST_SPACE_IDS = gql`
  query GetLatestSpaceIds($offset: Int = 0, $limit: Int!) {
    spaces(offset: $offset, limit: $limit, orderBy: id_DESC) {
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
        activity: { account: { id_not_eq: $address }, post: { isComment_eq: false } }
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
        where: { activity: { account: { id_not_eq: $address }, post: { isComment_eq: false } } }
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
export const GET_ACTIVITY_COUNTS = gql`
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
          PostReactionCreated
        ]
      }
    ) {
      totalCount
    }
    posts: activitiesConnection(
      orderBy: id_ASC
      where: {
        account: { id_eq: $address }
        event_in: [PostCreated]
        post: { isComment_eq: false }
      }
    ) {
      totalCount
    }
    spaces: activitiesConnection(
      orderBy: id_ASC
      where: { account: { id_eq: $address }, event_in: [SpaceCreated] }
    ) {
      totalCount
    }
    comments: activitiesConnection(
      orderBy: id_ASC
      where: {
        account: { id_eq: $address }
        event_in: [
          CommentCreated
          CommentShared
          CommentReplyCreated
          CommentReplyShared
          PostCreated
          PostShared
        ]
        post: { isComment_eq: true }
      }
    ) {
      totalCount
    }
    reactions: activitiesConnection(
      orderBy: id_ASC
      where: { account: { id_eq: $address }, event_in: [PostReactionCreated] }
    ) {
      totalCount
    }
    follows: activitiesConnection(
      orderBy: id_ASC
      where: { account: { id_eq: $address }, event_in: [AccountFollowed, SpaceFollowed] }
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
        where: { event_in: [AccountFollowed, SpaceFollowed] }
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
        where: { event_in: [PostReactionCreated, CommentReactionCreated] }
        limit: $limit
        offset: $offset
        orderBy: date_DESC
      ) {
        ...ActivityRequiredFragment
        post {
          id
        }
      }
    }
  }
`

export const GET_SPACE_ACTIVITIES = gql`
  query GetSpaceActivities($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      activities(
        where: { event_in: [SpaceCreated] }
        limit: $limit
        offset: $offset
        orderBy: date_DESC
      ) {
        space {
          id
        }
      }
    }
  }
`

export const GET_POST_ACTIVITIES = gql`
  query GetPostActivities($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      activities(
        where: { event_in: [PostCreated] }
        limit: $limit
        offset: $offset
        orderBy: date_DESC
      ) {
        post {
          id
        }
      }
    }
  }
`

export const GET_COMMENT_ACTIVITIES = gql`
  query GetCommentActivities($address: String!, $offset: Int = 0, $limit: Int!) {
    accountById(id: $address) {
      activities(
        where: { event_in: [CommentCreated, CommentReplyCreated, CommentShared] }
        limit: $limit
        offset: $offset
        orderBy: date_DESC
      ) {
        post {
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
        AND: {
          account: { id_eq: $address }
          OR: {
            activity: {
              post: {
                OR: [
                  { OR: { ownedByAccount: { id_eq: $address } } }
                  { OR: { rootPost: { ownedByAccount: { id_eq: $address } } } }
                  { OR: { parentPost: { ownedByAccount: { id_eq: $address } } } }
                ]
              }
            }
          }
        }
        activity: { aggregated_eq: true, account: { id_not_eq: $address }, date_gt: $afterDate }
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
        AND: {
          account: { id_eq: $address }
          OR: {
            activity: {
              post: {
                OR: [
                  { OR: { ownedByAccount: { id_eq: $address } } }
                  { OR: { rootPost: { ownedByAccount: { id_eq: $address } } } }
                  { OR: { parentPost: { ownedByAccount: { id_eq: $address } } } }
                  { OR: { rootPost: { space: { ownedByAccount: { id_eq: $address } } } } }
                ]
              }
            }
          }
        }
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
        }
      }
    }
  }
`

// Reactions
// ------------------------------------------------------------------------------------

export const GET_ADDRESS_POSTS_REACTION = gql`
  query GetAddressPostsReaction($address: String!, $postIds: [String!]!) {
    reactions(where: { post: { id_in: $postIds }, account: { id_eq: $address } }) {
      id
      kind
      post {
        id
      }
    }
  }
`
