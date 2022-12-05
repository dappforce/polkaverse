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
  id: string;
}

export interface ActivityRequiredFragment {
  __typename: "Activity";
  account: ActivityRequiredFragment_account;
  blockNumber: any;
  eventIndex: number;
  event: EventName;
  date: any;
  aggCount: any;
  aggregated: boolean | null;
}
