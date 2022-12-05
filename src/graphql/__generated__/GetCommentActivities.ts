/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCommentActivities
// ====================================================

export interface GetCommentActivities_accountById_activities_post {
  __typename: "Post";
  id: string;
}

export interface GetCommentActivities_accountById_activities {
  __typename: "Activity";
  post: GetCommentActivities_accountById_activities_post | null;
}

export interface GetCommentActivities_accountById {
  __typename: "Account";
  activities: GetCommentActivities_accountById_activities[];
}

export interface GetCommentActivities {
  accountById: GetCommentActivities_accountById | null;
}

export interface GetCommentActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
