/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSpaceActivities
// ====================================================

export interface GetSpaceActivities_accountById_spacesOwned {
  __typename: "Space";
  id: string;
}

export interface GetSpaceActivities_accountById {
  __typename: "Account";
  spacesOwned: GetSpaceActivities_accountById_spacesOwned[];
}

export interface GetSpaceActivities {
  accountById: GetSpaceActivities_accountById | null;
}

export interface GetSpaceActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
