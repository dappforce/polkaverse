// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
  /**
   * The Post ID, the same as it is on the blockchain.
   */
  id: string;
}

export interface GetAddressPostsReaction_reactions {
  __typename: "Reaction";
  /**
   * The ID of a Reaction, which will have the same value and reaction ID on the blockchain.
   */
  id: string;
  /**
   * The type of Reaction (Upvote, Downvote).
   */
  kind: ReactionKind;
  /**
   * A One-to-One relationship with the Post that the current reaction has been made for.
   */
  post: GetAddressPostsReaction_reactions_post;
}

export interface GetAddressPostsReaction {
  reactions: GetAddressPostsReaction_reactions[];
}

export interface GetAddressPostsReactionVariables {
  address: string;
  postIds: string[];
}
