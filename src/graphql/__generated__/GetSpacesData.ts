/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SpaceWhereInput } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetSpacesData
// ====================================================

export interface GetSpacesData_spaces_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetSpacesData_spaces_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface GetSpacesData_spaces_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface GetSpacesData_spaces_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface GetSpacesData_spaces_ownedByAccount_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: GetSpacesData_spaces_ownedByAccount_profileSpace_profileSpace | null;
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetSpacesData_spaces_ownedByAccount_profileSpace_createdByAccount;
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
  ownedByAccount: GetSpacesData_spaces_ownedByAccount_profileSpace_ownedByAccount;
}

export interface GetSpacesData_spaces_ownedByAccount {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: GetSpacesData_spaces_ownedByAccount_profileSpace | null;
}

export interface GetSpacesData_spaces {
  __typename: "Space";
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: GetSpacesData_spaces_createdByAccount;
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
  ownedByAccount: GetSpacesData_spaces_ownedByAccount;
}

export interface GetSpacesData {
  spaces: GetSpacesData_spaces[];
}

export interface GetSpacesDataVariables {
  where?: SpaceWhereInput | null;
}
