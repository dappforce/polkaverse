// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTweetActivities
// ====================================================

export interface GetTweetActivities_accountById_posts {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface GetTweetActivities_accountById {
  __typename: "Account";
  /**
   * A One-To-Many relationship with the Posts which are created by an Account (foreign key - "createdByAccount")
   */
  posts: GetTweetActivities_accountById_posts[];
}

export interface GetTweetActivities {
  accountById: GetTweetActivities_accountById | null;
}

export interface GetTweetActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
