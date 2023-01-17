/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetProfilesData
// ====================================================

export interface GetProfilesData_accounts_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface GetProfilesData_accounts_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetProfilesData_accounts_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface GetProfilesData_accounts_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: GetProfilesData_accounts_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetProfilesData_accounts_profileSpace_createdByAccount;
  email: string | null;
  name: string | null;
  linksOriginal: string | null;
  hidden: boolean;
  updatedAtTime: any | null;
  postsCount: number;
  image: string | null;
  tagsOriginal: string | null;
  about: string | null;
  ownedByAccount: GetProfilesData_accounts_profileSpace_ownedByAccount;
}

export interface GetProfilesData_accounts {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: GetProfilesData_accounts_profileSpace | null;
}

export interface GetProfilesData {
  accounts: GetProfilesData_accounts[];
}

export interface GetProfilesDataVariables {
  ids?: string[] | null;
}
