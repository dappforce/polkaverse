/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ProfileFragment
// ====================================================

export interface ProfileFragment_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface ProfileFragment_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface ProfileFragment_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface ProfileFragment_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: ProfileFragment_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: ProfileFragment_profileSpace_createdByAccount;
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
  ownedByAccount: ProfileFragment_profileSpace_ownedByAccount;
}

export interface ProfileFragment {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: ProfileFragment_profileSpace | null;
}
