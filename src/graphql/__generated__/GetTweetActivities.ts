/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTweetActivities
// ====================================================

export interface GetTweetActivities_accountById_posts {
  __typename: "Post";
  id: string;
}

export interface GetTweetActivities_accountById {
  __typename: "Account";
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
