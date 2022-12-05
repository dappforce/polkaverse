/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSpaceActivities
// ====================================================

export interface GetSpaceActivities_accountById_activities_space {
  __typename: "Space";
  id: string;
}

export interface GetSpaceActivities_accountById_activities {
  __typename: "Activity";
  space: GetSpaceActivities_accountById_activities_space | null;
}

export interface GetSpaceActivities_accountById {
  __typename: "Account";
  activities: GetSpaceActivities_accountById_activities[];
}

export interface GetSpaceActivities {
  accountById: GetSpaceActivities_accountById | null;
}

export interface GetSpaceActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
