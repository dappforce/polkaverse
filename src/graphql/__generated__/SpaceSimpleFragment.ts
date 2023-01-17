/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SpaceSimpleFragment
// ====================================================

export interface SpaceSimpleFragment_createdByAccount {
  __typename: "Account";
  id: string;
}

export interface SpaceSimpleFragment_ownedByAccount {
  __typename: "Account";
  id: string;
}

export interface SpaceSimpleFragment {
  __typename: "Space";
  canEveryoneCreatePosts: boolean | null;
  canFollowerCreatePosts: boolean | null;
  content: string | null;
  createdAtBlock: any | null;
  createdAtTime: any | null;
  createdByAccount: SpaceSimpleFragment_createdByAccount;
  email: string | null;
  name: string | null;
  linksOriginal: string | null;
  hidden: boolean;
  id: string;
  updatedAtTime: any | null;
  postsCount: number;
  image: string | null;
  tagsOriginal: string | null;
  about: string | null;
  ownedByAccount: SpaceSimpleFragment_ownedByAccount;
}
