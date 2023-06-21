// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PostKind } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL fragment: PostFragment
// ====================================================

export interface PostFragment_createdByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface PostFragment_tweetDetails {
  __typename: "TweetDetails";
  username: string | null;
}

export interface PostFragment_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  /**
   * The total number of all accounts being followed by the current Account (followingAccounts.length)
   */
  followingAccountsCount: number;
}

export interface PostFragment_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface PostFragment_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface PostFragment_ownedByAccount_profileSpace {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
  /**
   * A One-To-One relationship with the Account which uses the current Space as its profile.
   */
  profileSpace: PostFragment_ownedByAccount_profileSpace_profileSpace | null;
  /**
   * Is this a public space where anyone can post?
   */
  canEveryoneCreatePosts: boolean | null;
  /**
   * Are followers allowed to post in the Space?
   */
  canFollowerCreatePosts: boolean | null;
  /**
   * The CID of the content on IPFS
   */
  content: string | null;
  /**
   * The block height when a Space was created.
   */
  createdAtBlock: any | null;
  /**
   * The DateTime when a Space was created.
   */
  createdAtTime: any | null;
  /**
   * A One-To-One relationship with the Account entity that created a Space.
   */
  createdByAccount: PostFragment_ownedByAccount_profileSpace_createdByAccount;
  /**
   * The email address of a Space (IPFS content)
   */
  email: string | null;
  /**
   * The name of a Space (IPFS content)
   */
  name: string | null;
  /**
   * A list of the Space's links converted to a string with "comma" as a separator (IPFS content)
   */
  linksOriginal: string | null;
  /**
   * Is the Space hidden?
   */
  hidden: boolean;
  /**
   * The DateTime when a Space was updated.
   */
  updatedAtTime: any | null;
  /**
   * The total number of all Posts (public and hidden) in the current Space (post.length)
   */
  postsCount: number;
  /**
   * The URL of the Space's image (IPFS content)
   */
  image: string | null;
  /**
   * A list of a Space's tags, converted to a string with "comma" as a separator (IPFS content)
   */
  tagsOriginal: string | null;
  /**
   * The about text (bio) of a Space (IPFS content)
   */
  about: string | null;
  /**
   * A One-To-One relationship with the Account entity that owns a Space.
   */
  ownedByAccount: PostFragment_ownedByAccount_profileSpace_ownedByAccount;
}

export interface PostFragment_ownedByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
  /**
   * The total number of followers that an Account has (followers.length)
   */
  followersCount: number;
  /**
   * A One-To-One relationship with the particular Space entity which is defined as the Account Profile
   */
  profileSpace: PostFragment_ownedByAccount_profileSpace | null;
}

export interface PostFragment_space_createdByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface PostFragment_space_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  /**
   * The total number of all accounts being followed by the current Account (followingAccounts.length)
   */
  followingAccountsCount: number;
}

export interface PostFragment_space_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface PostFragment_space_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface PostFragment_space_ownedByAccount_profileSpace {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
  /**
   * A One-To-One relationship with the Account which uses the current Space as its profile.
   */
  profileSpace: PostFragment_space_ownedByAccount_profileSpace_profileSpace | null;
  /**
   * Is this a public space where anyone can post?
   */
  canEveryoneCreatePosts: boolean | null;
  /**
   * Are followers allowed to post in the Space?
   */
  canFollowerCreatePosts: boolean | null;
  /**
   * The CID of the content on IPFS
   */
  content: string | null;
  /**
   * The block height when a Space was created.
   */
  createdAtBlock: any | null;
  /**
   * The DateTime when a Space was created.
   */
  createdAtTime: any | null;
  /**
   * A One-To-One relationship with the Account entity that created a Space.
   */
  createdByAccount: PostFragment_space_ownedByAccount_profileSpace_createdByAccount;
  /**
   * The email address of a Space (IPFS content)
   */
  email: string | null;
  /**
   * The name of a Space (IPFS content)
   */
  name: string | null;
  /**
   * A list of the Space's links converted to a string with "comma" as a separator (IPFS content)
   */
  linksOriginal: string | null;
  /**
   * Is the Space hidden?
   */
  hidden: boolean;
  /**
   * The DateTime when a Space was updated.
   */
  updatedAtTime: any | null;
  /**
   * The total number of all Posts (public and hidden) in the current Space (post.length)
   */
  postsCount: number;
  /**
   * The URL of the Space's image (IPFS content)
   */
  image: string | null;
  /**
   * A list of a Space's tags, converted to a string with "comma" as a separator (IPFS content)
   */
  tagsOriginal: string | null;
  /**
   * The about text (bio) of a Space (IPFS content)
   */
  about: string | null;
  /**
   * A One-To-One relationship with the Account entity that owns a Space.
   */
  ownedByAccount: PostFragment_space_ownedByAccount_profileSpace_ownedByAccount;
}

export interface PostFragment_space_ownedByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
  /**
   * The total number of followers that an Account has (followers.length)
   */
  followersCount: number;
  /**
   * A One-To-One relationship with the particular Space entity which is defined as the Account Profile
   */
  profileSpace: PostFragment_space_ownedByAccount_profileSpace | null;
}

export interface PostFragment_space {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
  /**
   * Is this a public space where anyone can post?
   */
  canEveryoneCreatePosts: boolean | null;
  /**
   * Are followers allowed to post in the Space?
   */
  canFollowerCreatePosts: boolean | null;
  /**
   * The CID of the content on IPFS
   */
  content: string | null;
  /**
   * The block height when a Space was created.
   */
  createdAtBlock: any | null;
  /**
   * The DateTime when a Space was created.
   */
  createdAtTime: any | null;
  /**
   * A One-To-One relationship with the Account entity that created a Space.
   */
  createdByAccount: PostFragment_space_createdByAccount;
  /**
   * The email address of a Space (IPFS content)
   */
  email: string | null;
  /**
   * The name of a Space (IPFS content)
   */
  name: string | null;
  /**
   * A list of the Space's links converted to a string with "comma" as a separator (IPFS content)
   */
  linksOriginal: string | null;
  /**
   * Is the Space hidden?
   */
  hidden: boolean;
  /**
   * The DateTime when a Space was updated.
   */
  updatedAtTime: any | null;
  /**
   * The total number of all Posts (public and hidden) in the current Space (post.length)
   */
  postsCount: number;
  /**
   * The URL of the Space's image (IPFS content)
   */
  image: string | null;
  /**
   * A list of a Space's tags, converted to a string with "comma" as a separator (IPFS content)
   */
  tagsOriginal: string | null;
  /**
   * The about text (bio) of a Space (IPFS content)
   */
  about: string | null;
  /**
   * A One-To-One relationship with the Account entity that owns a Space.
   */
  ownedByAccount: PostFragment_space_ownedByAccount;
}

export interface PostFragment_rootPost {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface PostFragment_sharedPost {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface PostFragment {
  __typename: "Post";
  /**
   * The CID of the content on IPFS.
   */
  content: string | null;
  /**
   * The block height when a Post was created.
   */
  createdAtBlock: any | null;
  /**
   * The DateTime when a Post was created.
   */
  createdAtTime: any | null;
  /**
   * A One-To-One relationship with the Account entity of a Post's creator.
   */
  createdByAccount: PostFragment_createdByAccount;
  /**
   * The title of the Post (IPFS content)
   */
  title: string | null;
  /**
   * The body text of the Post (IPFS content)
   */
  body: string | null;
  /**
   * The URL for the Post's cover image (IPFS content)
   */
  image: string | null;
  /**
   * The link of the Post (IPFS content)
   */
  link: string | null;
  /**
   * The total number of DownVote reactions to the current Post.
   */
  downvotesCount: number;
  /**
   * Is the current post hidden?
   */
  hidden: boolean;
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
  /**
   * Is the current Post a Comment to a Regular Post or a Comment Post?
   */
  isComment: boolean;
  /**
   * The type of Post (Comment, SharedPost, or RegularPost)
   */
  kind: PostKind | null;
  /**
   * The total number of replies to the current Post.
   */
  repliesCount: number;
  /**
   * How many times the current Post has been shared.
   */
  sharesCount: number;
  /**
   * The total number of UpVote reactions to the current Post.
   */
  upvotesCount: number;
  /**
   * The time when a Post was created.
   */
  updatedAtTime: any | null;
  /**
   * Post canonical URL (IPFS content)
   */
  canonical: string | null;
  /**
   * A list of a Post's tags, converted to a string with "comma" as a separator (IPFS content)
   */
  tagsOriginal: string | null;
  /**
   * The ID of the tweet attached to the current Post (IPFS content)
   */
  tweetId: string | null;
  /**
   * The details of the tweet, such as creation time, username of the poster, etc. (IPFS content)
   */
  tweetDetails: PostFragment_tweetDetails | null;
  /**
   * A One-To-One relationship with the Account entity of a Post's owner. Currently we do not have Post transfer functionality.
   */
  ownedByAccount: PostFragment_ownedByAccount;
  /**
   * A One-To-One relationship with a Space that the current Post has been created in. It can be null if the Post is deleted (moved to Space with ID === null)
   */
  space: PostFragment_space | null;
  /**
   * A One-to-One relationship with a Post. This field only has a value if the current Post is a Comment or a Reply to a Comment, and contains a relationship with a top level Regular Post.
   */
  rootPost: PostFragment_rootPost | null;
  /**
   * A One-to-One relationship with a Post which has been shared. The Current Post is a new Post which has been created as a result of the sharing action, and can contain an additional body as a comment on the shared Post. "sharedPost" is relationhip with the Post that was shared.
   */
  sharedPost: PostFragment_sharedPost | null;
}
