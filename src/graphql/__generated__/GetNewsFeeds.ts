// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetNewsFeeds
// ====================================================

export interface GetNewsFeeds_accountById_feeds_activity_post {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
  /**
   * Is the current Post a Comment to a Regular Post or a Comment Post?
   */
  isComment: boolean;
}

export interface GetNewsFeeds_accountById_feeds_activity {
  __typename: "Activity";
  /**
   * A One-to-One relationship with the Post that is involved in the current Activity
   */
  post: GetNewsFeeds_accountById_feeds_activity_post | null;
}

export interface GetNewsFeeds_accountById_feeds {
  __typename: "NewsFeed";
  activity: GetNewsFeeds_accountById_feeds_activity;
}

export interface GetNewsFeeds_accountById {
  __typename: "Account";
  /**
   * A One-To-Many relationship between an Account and the Activities it has performed in the network through NewsFeed (foreign key - "account").
   * Each Activity has the "event<EventName>" and "post" fields, which can be used for adding created Posts to a user's Feed.
   */
  feeds: GetNewsFeeds_accountById_feeds[];
}

export interface GetNewsFeeds {
  accountById: GetNewsFeeds_accountById | null;
}

export interface GetNewsFeedsVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
