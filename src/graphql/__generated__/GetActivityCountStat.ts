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
