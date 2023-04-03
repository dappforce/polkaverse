/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EventName, ReactionKind } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetNotifications
// ====================================================

export interface GetNotifications_notifications_activity_account {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface GetNotifications_notifications_activity_post {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
  /**
   * Is the current Post a Comment to a Regular Post or a Comment Post?
   */
  isComment: boolean;
}

export interface GetNotifications_notifications_activity_space {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface GetNotifications_notifications_activity_followingAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface GetNotifications_notifications_activity_reaction {
  __typename: "Reaction";
  /**
   * The ID of a Reaction, which will have the same value and reaction ID on the blockchain.
   */
  id: string;
  /**
   * The type of Reaction (Upvote, Downvote).
   */
  kind: ReactionKind;
}

export interface GetNotifications_notifications_activity {
  __typename: "Activity";
  /**
   * A One-To-One relationship with the Account that initiated the current activity (it's usually a caller Account)
   */
  account: GetNotifications_notifications_activity_account;
  /**
   * The block height when an activity was done
   */
  blockNumber: any;
  /**
   * The event's index in the block
   */
  eventIndex: number;
  /**
   * The event's name
   */
  event: EventName;
  /**
   * The DateTime when the current activity was done
   */
  date: any;
  /**
   * The total number of Activities of the same event type for a specific Account.
   */
  aggCount: any;
  /**
   * Is this Activity the most recent in the list of Activities of this type (same event) from this account?
   */
  aggregated: boolean | null;
  /**
   * A One-to-One relationship with the Post that is involved in the current Activity
   */
  post: GetNotifications_notifications_activity_post | null;
  /**
   * A One-to-One relationship with the Space that is involved in the current Activity
   */
  space: GetNotifications_notifications_activity_space | null;
  /**
   * A One-to-One relationship with the following Account if the event is `AccountFollowed` or `AccountUnfollowed`.
   */
  followingAccount: GetNotifications_notifications_activity_followingAccount | null;
  /**
   * A One-to-One relationship with the Reaction that is involved in the current Activity
   */
  reaction: GetNotifications_notifications_activity_reaction | null;
}

export interface GetNotifications_notifications {
  __typename: "Notification";
  id: string;
  activity: GetNotifications_notifications_activity;
}

export interface GetNotifications {
  notifications: GetNotifications_notifications[];
}

export interface GetNotificationsVariables {
  address: string;
  offset?: number | null;
  limit: number;
}
