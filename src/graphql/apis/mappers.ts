import { summarizeMd } from '@subsocial/utils'
import { Activity, PostContent } from 'src/types'
import { ActivityRequiredFragment } from '../__generated__/ActivityRequiredFragment'
import { GetPostsData_posts } from '../__generated__/GetPostsData'
import { PostFragment } from '../__generated__/PostFragment'
import { PostSimpleFragment } from '../__generated__/PostSimpleFragment'
import { ProfileFragment } from '../__generated__/ProfileFragment'
import { ProfileSimpleFragment } from '../__generated__/ProfileSimpleFragment'
import { SpaceFragment } from '../__generated__/SpaceFragment'
import { SpaceSimpleFragment } from '../__generated__/SpaceSimpleFragment'
import {
  PostFragmentMapped,
  PostFragmentWithParent,
  PostSimpleFragmentMapped,
  ProfileFragmentMapped,
  ProfileSimpleFragmentMapped,
  SpaceFragmentMapped,
  SpaceSimpleFragmentMapped,
} from './types'

const SQUID_SEPARATOR = ','
const getTokensFromUnifiedString = (data: string | null) => data?.split(SQUID_SEPARATOR) ?? []

// This is hotfix, remove this if squid data is correct for comment event names.
export const mapCommentEventNames = (event: string, isComment: boolean | undefined) => {
  if (isComment) {
    const mapper = {
      PostReactionCreated: 'CommentReactionCreated',
      PostShared: 'CommentShared',
    }
    return (mapper as any)[event] ?? event
  }
  return event
}

export const mapActivityQueryResult = <T extends ActivityRequiredFragment>(
  activity: T,
  additionalData: Partial<Activity>,
) => {
  const { account, aggCount, aggregated, blockNumber, date, event, eventIndex } = activity
  return {
    account: account.id,
    aggCount,
    aggregated: !!aggregated,
    blockNumber,
    date,
    event: event as unknown as Activity['event'],
    eventIndex,
    ...additionalData,
  }
}

export const mapSimpleProfileFragment = ({
  id,
  followersCount,
  profileSpace,
}: ProfileSimpleFragment): ProfileSimpleFragmentMapped => ({
  id,
  accountFollowedCount: followersCount ?? 0,
  accountFollowersCount: profileSpace?.profileSpace?.followingAccountsCount ?? 0,
  spaceId: profileSpace?.id ?? '',
})

export const mapSimpleSpaceFragment = (space: SpaceSimpleFragment): SpaceSimpleFragmentMapped => {
  const summarizedAbout = summarizeMd(space.about ?? '')
  const getContent = () => ({
    image: space.image ?? '',
    name: space.name ?? '',
    tags: getTokensFromUnifiedString(space.tagsOriginal),
    summary: summarizedAbout.summary ?? '',
    about: space.about ?? '',
    email: space.email ?? '',
    links: getTokensFromUnifiedString(space.linksOriginal),
    isShowMore: summarizedAbout.isShowMore,
    experimental: space.experimental,
  })
  const isIpfsDataError =
    space.content && !space.name && !space.image && !space.about && !space.email
  return {
    canEveryoneCreatePosts: space.canEveryoneCreatePosts ?? false,
    canFollowerCreatePosts: space.canFollowerCreatePosts ?? false,
    createdAtBlock: space.createdAtBlock,
    createdAtTime: space.createdAtTime,
    createdByAccount: space.createdByAccount.id,
    hidden: space.hidden,
    id: space.id,
    ownerId: space.ownedByAccount.id,
    contentId: space.content ?? '',
    handle: undefined,
    postsCount: space.postsCount,
    ipfsContent: isIpfsDataError ? undefined : getContent(),
  }
}

function getFirstImageLink(mdText: string) {
  const imageRegex = /!\[.*?\]\((.*?)\)/
  const match = mdText.match(imageRegex)
  return match ? match[1] : null
}
export const mapSimplePostFragment = (post: PostSimpleFragment): PostSimpleFragmentMapped => {
  const getContent = (): PostContent & { isImageFromBody: boolean } => {
    const summary = summarizeMd(post.body ?? '')
    const firstImageLink = getFirstImageLink(post.body ?? '')
    return {
      summary: summary.summary ?? '',
      image: post.image || firstImageLink || '',
      isImageFromBody: !post.image && !!firstImageLink,
      title: post.title ?? '',
      link: post.link ?? undefined,
      body: post.body || '',
      canonical: post.canonical ?? '',
      isShowMore: summary.isShowMore,
      tags: getTokensFromUnifiedString(post.tagsOriginal),
      tweet: post.tweetId
        ? {
            id: post.tweetId,
            edit_history_tweet_ids: [],
            username: post.tweetDetails?.username ?? '',
          }
        : undefined,
    }
  }
  const isIpfsDataError = post.content && !post.body && !post.image && !post.title
  return {
    createdAtBlock: parseInt(post.createdAtBlock),
    createdAtTime: new Date(post.createdAtTime).getTime(),
    createdByAccount: post.createdByAccount.id,
    downvotesCount: post.downvotesCount,
    hidden: post.hidden,
    id: post.id,
    isComment: post.isComment,
    isRegularPost: post.kind === 'RegularPost',
    isSharedPost: post.kind === 'SharedPost',
    ownerId: post.ownedByAccount.id,
    upvotesCount: post.upvotesCount,
    contentId: post.content ?? '',
    repliesCount: post.repliesCount,
    sharesCount: post.sharesCount,
    spaceId: post.space?.id,
    isUpdated: !!post.updatedAtTime,
    originalPostId: post.sharedPost?.id,
    rootPostId: post.rootPost?.id,
    ipfsContent: isIpfsDataError ? undefined : getContent(),
  }
}

export const mapProfileFragment = (profile: ProfileFragment): ProfileFragmentMapped => ({
  ...mapSimpleProfileFragment(profile),
  profileSpace: profile.profileSpace && mapSimpleSpaceFragment(profile.profileSpace),
})

export const mapSpaceFragment = (space: SpaceFragment): SpaceFragmentMapped => ({
  ...mapSimpleSpaceFragment(space),
  ownedByAccount: mapProfileFragment(space.ownedByAccount),
})

export const mapPostFragment = (post: PostFragment): PostFragmentMapped => ({
  ...mapSimplePostFragment(post),
  ownedByAccount: post.ownedByAccount && mapProfileFragment(post.ownedByAccount),
  space: post.space && mapSpaceFragment(post.space),
})

export const mapPostFragmentWithParent = (post: GetPostsData_posts): PostFragmentWithParent => ({
  ...mapPostFragment(post),
  parentPost: post.parentPost && mapPostFragment(post.parentPost),
  sharedPost: post.sharedPost && mapPostFragment(post.sharedPost),
})
