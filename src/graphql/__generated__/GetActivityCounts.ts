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
  __typename: "ReactionsConnection";
  totalCount: number;
}

export interface GetActivityCounts_spaceFollows {
  __typename: "SpaceFollowersConnection";
  totalCount: number;
}

export interface GetActivityCounts_accountFollows {
  __typename: "AccountFollowersConnection";
  totalCount: number;
}

export interface GetActivityCounts {
  activities: GetActivityCounts_activities;
  posts: GetActivityCounts_posts;
  spaces: GetActivityCounts_spaces;
  comments: GetActivityCounts_comments;
  reactions: GetActivityCounts_reactions;
  spaceFollows: GetActivityCounts_spaceFollows;
  accountFollows: GetActivityCounts_accountFollows;
}

export interface GetActivityCountsVariables {
  address: string;
}
