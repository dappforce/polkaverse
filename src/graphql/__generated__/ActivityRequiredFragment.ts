// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { EventName } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL fragment: ActivityRequiredFragment
// ====================================================

export interface ActivityRequiredFragment_account {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface ActivityRequiredFragment {
  __typename: "Activity";
  /**
   * A One-To-One relationship with the Account that initiated the current activity (it's usually a caller Account)
   */
  account: ActivityRequiredFragment_account;
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
}
