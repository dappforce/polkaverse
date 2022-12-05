/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PostWhereInput, PostKind } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetPostsData
// ====================================================

export interface GetPostsData_posts_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface GetPostsData_posts_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: GetPostsData_posts_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_ownedByAccount_profileSpace_createdByAccount;
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
  ownedByAccount: GetPostsData_posts_ownedByAccount_profileSpace_ownedByAccount;
}

export interface GetPostsData_posts_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: GetPostsData_posts_ownedByAccount_profileSpace | null;
}

export interface GetPostsData_posts_space_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_space_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface GetPostsData_posts_space_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_space_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_space_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: GetPostsData_posts_space_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_space_ownedByAccount_profileSpace_createdByAccount;
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
  ownedByAccount: GetPostsData_posts_space_ownedByAccount_profileSpace_ownedByAccount;
}

export interface GetPostsData_posts_space_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: GetPostsData_posts_space_ownedByAccount_profileSpace | null;
}

export interface GetPostsData_posts_space {
  __typename: "Space";
  id: string;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_space_createdByAccount;
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
  ownedByAccount: GetPostsData_posts_space_ownedByAccount;
}

export interface GetPostsData_posts_parentPost_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_parentPost_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface GetPostsData_posts_parentPost_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_parentPost_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_parentPost_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: GetPostsData_posts_parentPost_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_parentPost_ownedByAccount_profileSpace_createdByAccount;
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
  ownedByAccount: GetPostsData_posts_parentPost_ownedByAccount_profileSpace_ownedByAccount;
}

export interface GetPostsData_posts_parentPost_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: GetPostsData_posts_parentPost_ownedByAccount_profileSpace | null;
}

export interface GetPostsData_posts_parentPost_space_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_parentPost_space_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface GetPostsData_posts_parentPost_space_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_parentPost_space_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_parentPost_space_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: GetPostsData_posts_parentPost_space_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_parentPost_space_ownedByAccount_profileSpace_createdByAccount;
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
  ownedByAccount: GetPostsData_posts_parentPost_space_ownedByAccount_profileSpace_ownedByAccount;
}

export interface GetPostsData_posts_parentPost_space_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: GetPostsData_posts_parentPost_space_ownedByAccount_profileSpace | null;
}

export interface GetPostsData_posts_parentPost_space {
  __typename: "Space";
  id: string;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_parentPost_space_createdByAccount;
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
  ownedByAccount: GetPostsData_posts_parentPost_space_ownedByAccount;
}

export interface GetPostsData_posts_parentPost_parentPost {
  __typename: "Post";
  id: string;
}

export interface GetPostsData_posts_parentPost_sharedPost {
  __typename: "Post";
  id: string;
}

export interface GetPostsData_posts_parentPost {
  __typename: "Post";
  id: string;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_parentPost_createdByAccount;
  title: string | null;
  summary: string | null;
  image: string | null;
  link: string | null;
  downvotesCount: number;
  hidden: boolean;
  isComment: boolean;
  kind: PostKind | null;
  repliesCount: number;
  sharesCount: number;
  upvotesCount: number;
  updatedAtTime: any | null;
  canonical: string | null;
  tagsOriginal: string | null;
  ownedByAccount: GetPostsData_posts_parentPost_ownedByAccount;
  space: GetPostsData_posts_parentPost_space | null;
  parentPost: GetPostsData_posts_parentPost_parentPost | null;
  sharedPost: GetPostsData_posts_parentPost_sharedPost | null;
}

export interface GetPostsData_posts_sharedPost_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_sharedPost_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface GetPostsData_posts_sharedPost_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_sharedPost_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_sharedPost_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: GetPostsData_posts_sharedPost_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_sharedPost_ownedByAccount_profileSpace_createdByAccount;
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
  ownedByAccount: GetPostsData_posts_sharedPost_ownedByAccount_profileSpace_ownedByAccount;
}

export interface GetPostsData_posts_sharedPost_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: GetPostsData_posts_sharedPost_ownedByAccount_profileSpace | null;
}

export interface GetPostsData_posts_sharedPost_space_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_sharedPost_space_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface GetPostsData_posts_sharedPost_space_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_sharedPost_space_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface GetPostsData_posts_sharedPost_space_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: GetPostsData_posts_sharedPost_space_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_sharedPost_space_ownedByAccount_profileSpace_createdByAccount;
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
  ownedByAccount: GetPostsData_posts_sharedPost_space_ownedByAccount_profileSpace_ownedByAccount;
}

export interface GetPostsData_posts_sharedPost_space_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: GetPostsData_posts_sharedPost_space_ownedByAccount_profileSpace | null;
}

export interface GetPostsData_posts_sharedPost_space {
  __typename: "Space";
  id: string;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_sharedPost_space_createdByAccount;
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
  ownedByAccount: GetPostsData_posts_sharedPost_space_ownedByAccount;
}

export interface GetPostsData_posts_sharedPost_parentPost {
  __typename: "Post";
  id: string;
}

export interface GetPostsData_posts_sharedPost_sharedPost {
  __typename: "Post";
  id: string;
}

export interface GetPostsData_posts_sharedPost {
  __typename: "Post";
  id: string;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_sharedPost_createdByAccount;
  title: string | null;
  summary: string | null;
  image: string | null;
  link: string | null;
  downvotesCount: number;
  hidden: boolean;
  isComment: boolean;
  kind: PostKind | null;
  repliesCount: number;
  sharesCount: number;
  upvotesCount: number;
  updatedAtTime: any | null;
  canonical: string | null;
  tagsOriginal: string | null;
  ownedByAccount: GetPostsData_posts_sharedPost_ownedByAccount;
  space: GetPostsData_posts_sharedPost_space | null;
  parentPost: GetPostsData_posts_sharedPost_parentPost | null;
  sharedPost: GetPostsData_posts_sharedPost_sharedPost | null;
}

export interface GetPostsData_posts {
  __typename: "Post";
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetPostsData_posts_createdByAccount;
  title: string | null;
  summary: string | null;
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
  ownedByAccount: GetPostsData_posts_ownedByAccount;
  space: GetPostsData_posts_space | null;
  parentPost: GetPostsData_posts_parentPost | null;
  sharedPost: GetPostsData_posts_sharedPost | null;
}

export interface GetPostsData {
  posts: GetPostsData_posts[];
}

export interface GetPostsDataVariables {
  where?: PostWhereInput | null;
}
