// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMostFollowedSpaceIdsInDateRange
// ====================================================

export interface GetMostFollowedSpaceIdsInDateRange_spaces {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface GetMostFollowedSpaceIdsInDateRange {
  spaces: GetMostFollowedSpaceIdsInDateRange_spaces[];
}

export interface GetMostFollowedSpaceIdsInDateRangeVariables {
  offset?: number | null;
  limit: number;
  startDate?: any | null;
  endDate?: any | null;
}
