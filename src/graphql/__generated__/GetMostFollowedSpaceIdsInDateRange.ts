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
