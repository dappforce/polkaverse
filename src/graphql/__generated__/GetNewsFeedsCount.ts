// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
