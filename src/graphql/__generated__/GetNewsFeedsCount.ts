/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetNewsFeedsCount
// ====================================================

export interface GetNewsFeedsCount_newsFeedsConnection {
  __typename: "NewsFeedsConnection";
  totalCount: number;
}

export interface GetNewsFeedsCount {
  newsFeedsConnection: GetNewsFeedsCount_newsFeedsConnection;
}

export interface GetNewsFeedsCountVariables {
  address: string;
}
