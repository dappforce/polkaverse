// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ElasticSearchIndexType } from "./../../types/graphql-global-types";

// ====================================================
// GraphQL query operation: GetSearchResults
// ====================================================

export interface GetSearchResults_searchQuery_hits__content {
  __typename: "HitItemContent";
  /**
   * Value of field `name` (actual only for Space entity)
   */
  name: string | null;
  /**
   * Value of field `about` (actual only for Space entity)
   */
  about: string | null;
  /**
   * Value of field `username` (actual only for Space entity)
   */
  username: string | null;
  /**
   * Value of field `title` (actual only for Post entity)
   */
  title: string | null;
  /**
   * Value of field `body` (actual only for Post entity)
   */
  body: string | null;
  /**
   * Value of field `spaceId` (actual only for Post entity)
   */
  spaceId: string | null;
  /**
   * List of tags
   */
  tags: string[] | null;
}

export interface GetSearchResults_searchQuery_hits {
  __typename: "HitItem";
  /**
   * Document source
   */
  _content: GetSearchResults_searchQuery_hits__content;
  /**
   * Document ID (equal to on-chain entity ID)
   */
  _id: string;
  /**
   * Index particular document is located in
   */
  _index: string;
}

export interface GetSearchResults_searchQuery {
  __typename: "ElasticSearchQueryResultEntity";
  /**
   * Search results list.
   */
  hits: (GetSearchResults_searchQuery_hits | null)[];
}

export interface GetSearchResults {
  searchQuery: GetSearchResults_searchQuery;
}

export interface GetSearchResultsVariables {
  tags?: string[] | null;
  q?: string | null;
  indexes?: ElasticSearchIndexType[] | null;
  spaceId?: string | null;
  limit?: number | null;
  offset?: number | null;
}
