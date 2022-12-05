/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SpaceFragment
// ====================================================

export interface SpaceFragment_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface SpaceFragment_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface SpaceFragment_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface SpaceFragment_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface SpaceFragment_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: SpaceFragment_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: SpaceFragment_ownedByAccount_profileSpace_createdByAccount;
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
  ownedByAccount: SpaceFragment_ownedByAccount_profileSpace_ownedByAccount;
}

export interface SpaceFragment_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: SpaceFragment_ownedByAccount_profileSpace | null;
}

export interface SpaceFragment {
  __typename: "Space";
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: SpaceFragment_createdByAccount;
  email: string | null;
  name: string | null;
  linksOriginal: string | null;
  hidden: boolean;
  id: string;
  updatedAtTime: any | null;
  postsCount: number;
  image: string | null;
  tagsOriginal: string | null;
  summary: string | null;
  about: string | null;
  ownedByAccount: SpaceFragment_ownedByAccount;
}
