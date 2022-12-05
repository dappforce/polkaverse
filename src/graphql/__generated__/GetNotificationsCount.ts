/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetNotificationsCount
// ====================================================

export interface GetNotificationsCount_notificationsConnection {
  __typename: "NotificationsConnection";
  totalCount: number;
}

export interface GetNotificationsCount {
  notificationsConnection: GetNotificationsCount_notificationsConnection;
}

export interface GetNotificationsCountVariables {
  address: string;
  afterDate?: any | null;
}
