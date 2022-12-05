/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSpaceIdsSortedByPostsCount
// ====================================================

export interface GetSpaceIdsSortedByPostsCount_spaces {
  __typename: "Space";
  id: string;
}

export interface GetSpaceIdsSortedByPostsCount {
  spaces: GetSpaceIdsSortedByPostsCount_spaces[];
}

export interface GetSpaceIdsSortedByPostsCountVariables {
  offset?: number | null;
  limit: number;
}
