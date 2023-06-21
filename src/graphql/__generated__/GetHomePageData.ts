// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

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
