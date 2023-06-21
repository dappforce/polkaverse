// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface GetFollowActivities_accountById_activities_space {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface GetFollowActivities_accountById_activities_followingAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface GetFollowActivities_accountById_activities {
  __typename: "Activity";
  /**
   * A One-To-One relationship with the Account that initiated the current activity (it's usually a caller Account)
   */
  account: GetFollowActivities_accountById_activities_account;
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
   * A One-to-One relationship with the Space that is involved in the current Activity
   */
  space: GetFollowActivities_accountById_activities_space | null;
  /**
   * A One-to-One relationship with the following Account if the event is `AccountFollowed` or `AccountUnfollowed`.
   */
  followingAccount: GetFollowActivities_accountById_activities_followingAccount | null;
}

export interface GetFollowActivities_accountById {
  __typename: "Account";
  /**
   * A One-To-Many relationship with the Activities which have been performed by an Account (foreign key - "account")
   */
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
