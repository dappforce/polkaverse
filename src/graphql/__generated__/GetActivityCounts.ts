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
  spaces: GetActivityCounts_spaces;
  comments: GetActivityCounts_comments;
  reactions: GetActivityCounts_reactions;
  follows: GetActivityCounts_follows;
}

export interface GetActivityCountsVariables {
  address: string;
}
