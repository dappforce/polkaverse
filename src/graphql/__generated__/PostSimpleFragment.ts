// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PostKind } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL fragment: PostSimpleFragment
// ====================================================

export interface PostSimpleFragment_createdByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface PostSimpleFragment_tweetDetails {
  __typename: "TweetDetails";
  username: string | null;
}

export interface PostSimpleFragment_ownedByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface PostSimpleFragment_space {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface PostSimpleFragment_rootPost {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface PostSimpleFragment_sharedPost {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface PostSimpleFragment {
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
  createdByAccount: PostSimpleFragment_createdByAccount;
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
  tweetDetails: PostSimpleFragment_tweetDetails | null;
  /**
   * A One-To-One relationship with the Account entity of a Post's owner. Currently we do not have Post transfer functionality.
   */
  ownedByAccount: PostSimpleFragment_ownedByAccount;
  /**
   * A One-To-One relationship with a Space that the current Post has been created in. It can be null if the Post is deleted (moved to Space with ID === null)
   */
  space: PostSimpleFragment_space | null;
  /**
   * A One-to-One relationship with a Post. This field only has a value if the current Post is a Comment or a Reply to a Comment, and contains a relationship with a top level Regular Post.
   */
  rootPost: PostSimpleFragment_rootPost | null;
  /**
   * A One-to-One relationship with a Post which has been shared. The Current Post is a new Post which has been created as a result of the sharing action, and can contain an additional body as a comment on the shared Post. "sharedPost" is relationhip with the Post that was shared.
   */
  sharedPost: PostSimpleFragment_sharedPost | null;
}
