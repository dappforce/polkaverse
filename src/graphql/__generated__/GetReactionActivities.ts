/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EventName } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetReactionActivities
// ====================================================

export interface GetReactionActivities_accountById_activities_account {
  __typename: "Account";
  id: string;
}

export interface GetReactionActivities_accountById_activities_post {
  __typename: "Post";
  id: string;
}

export interface GetReactionActivities_accountById_activities {
  __typename: "Activity";
  account: GetReactionActivities_accountById_activities_account;
  blockNumber: any;
  eventIndex: number;
  event: EventName;
  date: any;
  aggCount: any;
  aggregated: boolean | null;
  post: GetReactionActivities_accountById_activities_post | null;
}

export interface GetReactionActivities_accountById {
  __typename: "Account";
  activities: GetReactionActivities_accountById_activities[];
}

export interface GetReactionActivities {
  accountById: GetReactionActivities_accountById | null;
}

export interface GetReactionActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
