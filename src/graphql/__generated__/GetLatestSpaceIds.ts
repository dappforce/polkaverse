/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLatestSpaceIds
// ====================================================

export interface GetLatestSpaceIds_spaces {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface GetLatestSpaceIds {
  spaces: GetLatestSpaceIds_spaces[];
}

export interface GetLatestSpaceIdsVariables {
  offset?: number | null;
  limit: number;
}
