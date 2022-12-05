/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSpaceIdsSortedByPostsCountInDateRange
// ====================================================

export interface GetSpaceIdsSortedByPostsCountInDateRange_spaces {
  __typename: "Space";
  id: string;
}

export interface GetSpaceIdsSortedByPostsCountInDateRange {
  spaces: GetSpaceIdsSortedByPostsCountInDateRange_spaces[];
}

export interface GetSpaceIdsSortedByPostsCountInDateRangeVariables {
  offset?: number | null;
  limit: number;
  startDate?: any | null;
  endDate?: any | null;
}
