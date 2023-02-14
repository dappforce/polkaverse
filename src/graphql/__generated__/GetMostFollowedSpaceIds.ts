/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetMostFollowedSpaceIds
// ====================================================

export interface GetMostFollowedSpaceIds_spaces {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
}

export interface GetMostFollowedSpaceIds {
  spaces: GetMostFollowedSpaceIds_spaces[];
}

export interface GetMostFollowedSpaceIdsVariables {
  offset?: number | null;
  limit: number;
}
