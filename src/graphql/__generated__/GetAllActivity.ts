/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EventName } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetAllActivity
// ====================================================

export interface GetAllActivity_accountById_activities_account {
  __typename: "Account";
  id: string;
}

export interface GetAllActivity_accountById_activities_post {
  __typename: "Post";
  id: string;
  isComment: boolean;
}

export interface GetAllActivity_accountById_activities_space {
  __typename: "Space";
  id: string;
}

export interface GetAllActivity_accountById_activities_followingAccount {
  __typename: "Account";
  id: string;
}

export interface GetAllActivity_accountById_activities_reaction {
  __typename: "Reaction";
  id: string;
}

export interface GetAllActivity_accountById_activities {
  __typename: "Activity";
  account: GetAllActivity_accountById_activities_account;
  blockNumber: any;
  eventIndex: number;
  event: EventName;
  date: any;
  aggCount: any;
  aggregated: boolean | null;
  post: GetAllActivity_accountById_activities_post | null;
  space: GetAllActivity_accountById_activities_space | null;
  followingAccount: GetAllActivity_accountById_activities_followingAccount | null;
  reaction: GetAllActivity_accountById_activities_reaction | null;
}

export interface GetAllActivity_accountById {
  __typename: "Account";
  activities: GetAllActivity_accountById_activities[];
}

export interface GetAllActivity {
  accountById: GetAllActivity_accountById | null;
}

export interface GetAllActivityVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
