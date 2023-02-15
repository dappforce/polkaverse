/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ProfileSimpleFragment
// ====================================================

export interface ProfileSimpleFragment_profileSpace_profileSpace {
  __typename: "Account";
  /**
   * The total number of all accounts being followed by the current Account (followingAccounts.length)
   */
  followingAccountsCount: number;
}

export interface ProfileSimpleFragment_profileSpace {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
  /**
   * A One-To-One relationship with the Account which uses the current Space as its profile.
   */
  profileSpace: ProfileSimpleFragment_profileSpace_profileSpace | null;
}

export interface ProfileSimpleFragment {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
  /**
   * The total number of followers that an Account has (followers.length)
   */
  followersCount: number;
  /**
   * A One-To-One relationship with the particular Space entity which is defined as the Account Profile
   */
  profileSpace: ProfileSimpleFragment_profileSpace | null;
}
