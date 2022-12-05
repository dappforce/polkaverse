/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetNewsFeeds
// ====================================================

export interface GetNewsFeeds_accountById_feeds_activity_post {
  __typename: "Post";
  id: string;
  isComment: boolean;
}

export interface GetNewsFeeds_accountById_feeds_activity {
  __typename: "Activity";
  post: GetNewsFeeds_accountById_feeds_activity_post | null;
}

export interface GetNewsFeeds_accountById_feeds {
  __typename: "NewsFeed";
  activity: GetNewsFeeds_accountById_feeds_activity;
}

export interface GetNewsFeeds_accountById {
  __typename: "Account";
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
