/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSpaceIdsSortedByPostsCount
// ====================================================

export interface GetSpaceIdsSortedByPostsCount_spaces {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface GetSpaceIdsSortedByPostsCount {
  spaces: GetSpaceIdsSortedByPostsCount_spaces[];
}

export interface GetSpaceIdsSortedByPostsCountVariables {
  offset?: number | null;
  limit: number;
}
