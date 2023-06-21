// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPostActivities
// ====================================================

export interface GetPostActivities_accountById_posts {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface GetPostActivities_accountById {
  __typename: "Account";
  /**
   * A One-To-Many relationship with the Posts which are created by an Account (foreign key - "createdByAccount")
   */
  posts: GetPostActivities_accountById_posts[];
}

export interface GetPostActivities {
  accountById: GetPostActivities_accountById | null;
}

export interface GetPostActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
