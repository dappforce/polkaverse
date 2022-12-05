/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ReactionKind } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetAddressPostsReaction
// ====================================================

export interface GetAddressPostsReaction_reactions_post {
  __typename: "Post";
  id: string;
}

export interface GetAddressPostsReaction_reactions {
  __typename: "Reaction";
  id: string;
  kind: ReactionKind;
  post: GetAddressPostsReaction_reactions_post;
}

export interface GetAddressPostsReaction {
  reactions: GetAddressPostsReaction_reactions[];
}

export interface GetAddressPostsReactionVariables {
  address: string;
  postIds: string[];
}
