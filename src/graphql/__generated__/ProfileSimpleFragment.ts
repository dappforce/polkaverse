/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ProfileSimpleFragment
// ====================================================

export interface ProfileSimpleFragment_profileSpace_profileSpace {
  __typename: "Account";
  followingAccountsCount: number;
}

export interface ProfileSimpleFragment_profileSpace {
  __typename: "Space";
  id: string;
  profileSpace: ProfileSimpleFragment_profileSpace_profileSpace | null;
}

export interface ProfileSimpleFragment {
  __typename: "Account";
  id: string;
  followersCount: number;
  profileSpace: ProfileSimpleFragment_profileSpace | null;
}
