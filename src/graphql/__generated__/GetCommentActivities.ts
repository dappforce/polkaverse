/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCommentActivities
// ====================================================

export interface GetCommentActivities_accountById_posts {
  __typename: "Post";
  id: string;
}

export interface GetCommentActivities_accountById {
  __typename: "Account";
  posts: GetCommentActivities_accountById_posts[];
}

export interface GetCommentActivities {
  accountById: GetCommentActivities_accountById | null;
}

export interface GetCommentActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
