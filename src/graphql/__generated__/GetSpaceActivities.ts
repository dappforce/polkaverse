// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSpaceActivities
// ====================================================

export interface GetSpaceActivities_accountById_spacesOwned {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface GetSpaceActivities_accountById {
  __typename: "Account";
  /**
   * A One-To-Many relationship with the Spaces that are currently owned by an Account  (foreign key - "ownedByAccount")
   */
  spacesOwned: GetSpaceActivities_accountById_spacesOwned[];
}

export interface GetSpaceActivities {
  accountById: GetSpaceActivities_accountById | null;
}

export interface GetSpaceActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
