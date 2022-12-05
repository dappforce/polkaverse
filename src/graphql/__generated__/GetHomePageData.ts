/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetHomePageData
// ====================================================

export interface GetHomePageData_postCount {
  __typename: "PostsConnection";
  totalCount: number;
}

export interface GetHomePageData_spaceCount {
  __typename: "SpacesConnection";
  totalCount: number;
}

export interface GetHomePageData {
  postCount: GetHomePageData_postCount;
  spaceCount: GetHomePageData_spaceCount;
}
