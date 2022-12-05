/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPostActivities
// ====================================================

export interface GetPostActivities_accountById_activities_post {
  __typename: "Post";
  id: string;
}

export interface GetPostActivities_accountById_activities {
  __typename: "Activity";
  post: GetPostActivities_accountById_activities_post | null;
}

export interface GetPostActivities_accountById {
  __typename: "Account";
  activities: GetPostActivities_accountById_activities[];
}

export interface GetPostActivities {
  accountById: GetPostActivities_accountById | null;
}

export interface GetPostActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
