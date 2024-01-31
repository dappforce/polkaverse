import { combineReducers } from '@reduxjs/toolkit'
import myAccount from '../features/accounts/myAccountSlice'
import spaceEditors from '../features/accounts/spaceEditorsSlice'
import addressLikeCount from '../features/activeStaking/addressLikeCountSlice'
import canPostSuperLiked from '../features/activeStaking/canPostSuperLikedSlice'
import postReward from '../features/activeStaking/postRewardSlice'
import prevReward from '../features/activeStaking/prevRewardSlice'
import rewardHistory from '../features/activeStaking/rewardHistorySlice'
import rewardReport from '../features/activeStaking/rewardReportSlice'
import superLikeCounts from '../features/activeStaking/superLikeCountsSlice'
import chainsInfo from '../features/chainsInfo/chainsInfoSlice'
import chat from '../features/chat/chatSlice'
import enableConfirmation from '../features/confirmationPopup/enableConfirmationSlice'
import contents from '../features/contents/contentsSlice'
import creatorsList from '../features/creators/creatorsListSlice'
import stakes from '../features/creators/stakesSlice'
import totalStake from '../features/creators/totalStakeSlice'
import ordersById from '../features/domainPendingOrders/pendingOrdersSlice'
import domainByOwner from '../features/domains/domainsByOwnerSlice'
import domains from '../features/domains/domainsSlice'
import topLevelDomains from '../features/domains/topLevelDomains'
import generalStatistics from '../features/leaderboard/generalStatisticsSlice'
import leaderboard from '../features/leaderboard/leaderboardSlice'
import topUsers from '../features/leaderboard/topUsersSlice'
import userStatistics from '../features/leaderboard/userStatisticsSlice'
import onBoarding from '../features/onBoarding/onBoardingSlice'
import mySpacePermissions from '../features/permissions/mySpacePermissionsSlice'
import myFeed from '../features/posts/myFeedSlice'
import ownPostIds from '../features/posts/ownPostIdsSlice'
import postScores from '../features/posts/postScoreSlice'
import posts from '../features/posts/postsSlice'
import followedAccountIds from '../features/profiles/followedAccountIdsSlice'
import profileSpaces from '../features/profiles/profilesSlice'
import myPostReactions from '../features/reactions/myPostReactionsSlice'
import lowValueIds from '../features/replies/lowValueIdsSlice'
import replyIds from '../features/replies/repliesSlice'
import sellerConfig from '../features/sellerConfig/sellerConfigSlice'
import followedSpaceIds from '../features/spaceIds/followedSpaceIdsSlice'
import ownSpaceIds from '../features/spaceIds/ownSpaceIdsSlice'
import spaceIdsWithRolesByAccount from '../features/spaceIds/spaceIdsWithRolesByAccountSlice'
import spaces from '../features/spaces/spacesSlice'

const rootReducer = combineReducers({
  contents,
  profileSpaces,
  spaces,
  posts,
  replyIds,
  followedSpaceIds,
  followedAccountIds,
  ownSpaceIds,
  myPostReactions,
  spaceIdsWithRolesByAccount,
  spaceEditors,
  mySpacePermissions,
  myAccount,
  ownPostIds,
  myFeed,
  domainByOwner,
  domains,
  topLevelDomains,
  chainsInfo,
  onBoarding,
  ordersById,
  sellerConfig,
  enableConfirmation,
  chat,
  stakes,
  totalStake,
  creatorsList,
  superLikeCounts,
  addressLikeCount,
  rewardReport,
  rewardHistory,
  canPostSuperLiked,
  postReward,
  topUsers,
  userStatistics,
  generalStatistics,
  leaderboard,
  postScores,
  prevReward,
  lowValueIds,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
