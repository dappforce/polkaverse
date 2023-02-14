/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PostKind } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetMostCommentedPostIds
// ====================================================

export interface GetMostCommentedPostIds_posts {
  __typename: "Post";
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface GetMostCommentedPostIds {
  posts: GetMostCommentedPostIds_posts[];
}

export interface GetMostCommentedPostIdsVariables {
  kind?: PostKind | null;
  offset?: number | null;
  limit?: number | null;
}
