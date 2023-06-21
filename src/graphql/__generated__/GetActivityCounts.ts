// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetActivityCounts
// ====================================================

export interface GetActivityCounts_activities {
  __typename: "ActivitiesConnection";
  totalCount: number;
}

export interface GetActivityCounts_posts {
  __typename: "PostsConnection";
  totalCount: number;
}

export interface GetActivityCounts_tweets {
  __typename: "PostsConnection";
  totalCount: number;
}

export interface GetActivityCounts_spaces {
  __typename: "SpacesConnection";
  totalCount: number;
}

export interface GetActivityCounts_comments {
  __typename: "PostsConnection";
  totalCount: number;
}

export interface GetActivityCounts_reactions {
  __typename: "ActivitiesConnection";
  totalCount: number;
}

export interface GetActivityCounts_follows {
  __typename: "ActivitiesConnection";
  totalCount: number;
}

export interface GetActivityCounts {
  activities: GetActivityCounts_activities;
  posts: GetActivityCounts_posts;
  tweets: GetActivityCounts_tweets;
  spaces: GetActivityCounts_spaces;
  comments: GetActivityCounts_comments;
  reactions: GetActivityCounts_reactions;
  follows: GetActivityCounts_follows;
}

export interface GetActivityCountsVariables {
  address: string;
}
