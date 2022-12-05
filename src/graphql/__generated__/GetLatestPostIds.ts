/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PostKind } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetLatestPostIds
// ====================================================

export interface GetLatestPostIds_posts {
  __typename: "Post";
  id: string;
}

export interface GetLatestPostIds {
  posts: GetLatestPostIds_posts[];
}

export interface GetLatestPostIdsVariables {
  kind?: PostKind | null;
  offset?: number | null;
  limit: number;
}
