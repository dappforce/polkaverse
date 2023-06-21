// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetFollowingSpaces
// ====================================================

export interface GetFollowingSpaces_accountById_spacesFollowed_followingSpace {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface GetFollowingSpaces_accountById_spacesFollowed {
  __typename: "SpaceFollowers";
  followingSpace: GetFollowingSpaces_accountById_spacesFollowed_followingSpace;
}

export interface GetFollowingSpaces_accountById {
  __typename: "Account";
  /**
   * A One-To-Many relationship between an Account and the Spaces that it follows through SpaceFollowers (foreign key - "followerAccount")
   */
  spacesFollowed: GetFollowingSpaces_accountById_spacesFollowed[];
}

export interface GetFollowingSpaces {
  accountById: GetFollowingSpaces_accountById | null;
}

export interface GetFollowingSpacesVariables {
  address: string;
}
