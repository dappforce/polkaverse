// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetActivityCountStat
// ====================================================

export interface GetActivityCountStat_total {
  __typename: "ActivitiesConnection";
  totalCount: number;
}

export interface GetActivityCountStat_period {
  __typename: "ActivitiesConnection";
  totalCount: number;
}

export interface GetActivityCountStat_today {
  __typename: "ActivitiesConnection";
  totalCount: number;
}

export interface GetActivityCountStat {
  total: GetActivityCountStat_total;
  period: GetActivityCountStat_period;
  today: GetActivityCountStat_today;
}
