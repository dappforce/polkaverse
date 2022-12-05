/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EventName } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetFollowActivities
// ====================================================

export interface GetFollowActivities_accountById_activities_account {
  __typename: "Account";
  id: string;
}

export interface GetFollowActivities_accountById_activities_space {
  __typename: "Space";
  id: string;
}

export interface GetFollowActivities_accountById_activities_followingAccount {
  __typename: "Account";
  id: string;
}

export interface GetFollowActivities_accountById_activities {
  __typename: "Activity";
  account: GetFollowActivities_accountById_activities_account;
  blockNumber: any;
  eventIndex: number;
  event: EventName;
  date: any;
  aggCount: any;
  aggregated: boolean | null;
  space: GetFollowActivities_accountById_activities_space | null;
  followingAccount: GetFollowActivities_accountById_activities_followingAccount | null;
}

export interface GetFollowActivities_accountById {
  __typename: "Account";
  activities: GetFollowActivities_accountById_activities[];
}

export interface GetFollowActivities {
  accountById: GetFollowActivities_accountById | null;
}

export interface GetFollowActivitiesVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
