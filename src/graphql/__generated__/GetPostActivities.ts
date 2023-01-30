/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPostActivities
// ====================================================

export interface GetPostActivities_accountById_posts {
  __typename: "Post";
  id: string;
}

export interface GetPostActivities_accountById {
  __typename: "Account";
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
