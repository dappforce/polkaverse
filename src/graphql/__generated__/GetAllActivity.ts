/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EventName, ReactionKind } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetAllActivity
// ====================================================

export interface GetAllActivity_accountById_activities_account {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface GetAllActivity_accountById_activities_post {
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

export interface GetAllActivity_accountById_activities_space {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface GetAllActivity_accountById_activities_followingAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface GetAllActivity_accountById_activities_reaction {
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

export interface GetAllActivity_accountById_activities {
  __typename: "Activity";
  /**
   * A One-To-One relationship with the Account that initiated the current activity (it's usually a caller Account)
   */
  account: GetAllActivity_accountById_activities_account;
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
  post: GetAllActivity_accountById_activities_post | null;
  /**
   * A One-to-One relationship with the Space that is involved in the current Activity
   */
  space: GetAllActivity_accountById_activities_space | null;
  /**
   * A One-to-One relationship with the following Account if the event is `AccountFollowed` or `AccountUnfollowed`.
   */
  followingAccount: GetAllActivity_accountById_activities_followingAccount | null;
  /**
   * A One-to-One relationship with the Reaction that is involved in the current Activity
   */
  reaction: GetAllActivity_accountById_activities_reaction | null;
}

export interface GetAllActivity_accountById {
  __typename: "Account";
  /**
   * A One-To-Many relationship with the Activities which have been performed by an Account (foreign key - "account")
   */
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
