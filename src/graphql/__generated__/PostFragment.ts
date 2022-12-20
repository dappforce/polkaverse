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
  id: string;
}

export interface PostFragment_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface PostFragment_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface PostFragment_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface PostFragment_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: PostFragment_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: PostFragment_ownedByAccount_profileSpace_createdByAccount;
  email: string | null;
  name: string | null;
  linksOriginal: string | null;
  hidden: boolean;
  updatedAtTime: any | null;
  postsCount: number;
  image: string | null;
  tagsOriginal: string | null;
  summary: string | null;
  about: string | null;
  ownedByAccount: PostFragment_ownedByAccount_profileSpace_ownedByAccount;
}

export interface PostFragment_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: PostFragment_ownedByAccount_profileSpace | null;
}

export interface PostFragment_space_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface PostFragment_space_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface PostFragment_space_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface PostFragment_space_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface PostFragment_space_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: PostFragment_space_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: PostFragment_space_ownedByAccount_profileSpace_createdByAccount;
  email: string | null;
  name: string | null;
  linksOriginal: string | null;
  hidden: boolean;
  updatedAtTime: any | null;
  postsCount: number;
  image: string | null;
  tagsOriginal: string | null;
  summary: string | null;
  about: string | null;
  ownedByAccount: PostFragment_space_ownedByAccount_profileSpace_ownedByAccount;
}

export interface PostFragment_space_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: PostFragment_space_ownedByAccount_profileSpace | null;
}

export interface PostFragment_space {
  __typename: "Space";
  id: string;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: PostFragment_space_createdByAccount;
  email: string | null;
  name: string | null;
  linksOriginal: string | null;
  hidden: boolean;
  updatedAtTime: any | null;
  postsCount: number;
  image: string | null;
  tagsOriginal: string | null;
  summary: string | null;
  about: string | null;
  ownedByAccount: PostFragment_space_ownedByAccount;
}

export interface PostFragment_parentPost {
  __typename: "Post";
  id: string;
}

export interface PostFragment_sharedPost {
  __typename: "Post";
  id: string;
}

export interface PostFragment {
  __typename: "Post";
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: PostFragment_createdByAccount;
  title: string | null;
  summary: string | null;
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
  ownedByAccount: PostFragment_ownedByAccount;
  space: PostFragment_space | null;
  parentPost: PostFragment_parentPost | null;
  sharedPost: PostFragment_sharedPost | null;
}
