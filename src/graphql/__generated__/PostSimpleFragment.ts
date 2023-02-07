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
  id: string;
}

export interface PostSimpleFragment_tweetDetails {
  __typename: "TweetDetails";
  username: string | null;
}

export interface PostSimpleFragment_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface PostSimpleFragment_space {
  __typename: "Space";
  id: string;
}

export interface PostSimpleFragment_rootPost {
  __typename: "Post";
  id: string;
}

export interface PostSimpleFragment_sharedPost {
  __typename: "Post";
  id: string;
}

export interface PostSimpleFragment {
  __typename: "Post";
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: PostSimpleFragment_createdByAccount;
  title: string | null;
  body: string | null;
  image: string | null;
  link: string | null;
  downvotesCount: number;
  hidden: boolean;
  id: string;
  isComment: boolean;
  kind: PostKind | null;
  repliesCount: number;
  sharesCount: number;
  upvotesCount: number;
  updatedAtTime: any | null;
  canonical: string | null;
  tagsOriginal: string | null;
  tweetId: string | null;
  tweetDetails: PostSimpleFragment_tweetDetails | null;
  ownedByAccount: PostSimpleFragment_ownedByAccount;
  space: PostSimpleFragment_space | null;
  rootPost: PostSimpleFragment_rootPost | null;
  sharedPost: PostSimpleFragment_sharedPost | null;
}
