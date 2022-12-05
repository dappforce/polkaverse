/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EventName } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetNotifications
// ====================================================

export interface GetNotifications_accountById_notifications_activity_account {
  __typename: "Account";
  id: string;
}

export interface GetNotifications_accountById_notifications_activity_post {
  __typename: "Post";
  id: string;
  isComment: boolean;
}

export interface GetNotifications_accountById_notifications_activity_space {
  __typename: "Space";
  id: string;
}

export interface GetNotifications_accountById_notifications_activity_followingAccount {
  __typename: "Account";
  id: string;
}

export interface GetNotifications_accountById_notifications_activity_reaction {
  __typename: "Reaction";
  id: string;
}

export interface GetNotifications_accountById_notifications_activity {
  __typename: "Activity";
  account: GetNotifications_accountById_notifications_activity_account;
  blockNumber: any;
  eventIndex: number;
  event: EventName;
  date: any;
  aggCount: any;
  aggregated: boolean | null;
  post: GetNotifications_accountById_notifications_activity_post | null;
  space: GetNotifications_accountById_notifications_activity_space | null;
  followingAccount: GetNotifications_accountById_notifications_activity_followingAccount | null;
  reaction: GetNotifications_accountById_notifications_activity_reaction | null;
}

export interface GetNotifications_accountById_notifications {
  __typename: "Notification";
  id: string;
  activity: GetNotifications_accountById_notifications_activity;
}

export interface GetNotifications_accountById {
  __typename: "Account";
  notifications: GetNotifications_accountById_notifications[];
}

export interface GetNotifications {
  accountById: GetNotifications_accountById | null;
}

export interface GetNotificationsVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
