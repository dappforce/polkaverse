// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PostKind } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetMostLikedPostIdsInDateRange
// ====================================================

export interface GetMostLikedPostIdsInDateRange_posts {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface GetMostLikedPostIdsInDateRange {
  posts: GetMostLikedPostIdsInDateRange_posts[];
}

export interface GetMostLikedPostIdsInDateRangeVariables {
  kind?: PostKind | null;
  offset?: number | null;
  limit?: number | null;
  startDate?: any | null;
  endDate?: any | null;
}
