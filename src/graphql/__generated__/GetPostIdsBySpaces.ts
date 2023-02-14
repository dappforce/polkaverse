/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetPostIdsBySpaces
// ====================================================

export interface GetPostIdsBySpaces_posts {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface GetPostIdsBySpaces {
  posts: GetPostIdsBySpaces_posts[];
}

export interface GetPostIdsBySpacesVariables {
  spaceIds: string[];
}
