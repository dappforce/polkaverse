// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SpaceFragment
// ====================================================

export interface SpaceFragment_createdByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface SpaceFragment_ownedByAccount_profileSpace_profileSpace {
  __typename: "Account";
  /**
   * The total number of all accounts being followed by the current Account (followingAccounts.length)
   */
  followingAccountsCount: number;
}

export interface SpaceFragment_ownedByAccount_profileSpace_createdByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface SpaceFragment_ownedByAccount_profileSpace_ownedByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface SpaceFragment_ownedByAccount_profileSpace {
  __typename: "Space";
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
  /**
   * A One-To-One relationship with the Account which uses the current Space as its profile.
   */
  profileSpace: SpaceFragment_ownedByAccount_profileSpace_profileSpace | null;
  /**
   * Is this a public space where anyone can post?
   */
  canEveryoneCreatePosts: boolean | null;
  /**
   * Are followers allowed to post in the Space?
   */
  canFollowerCreatePosts: boolean | null;
  /**
   * The CID of the content on IPFS
   */
  content: string | null;
  /**
   * The block height when a Space was created.
   */
  createdAtBlock: any | null;
  /**
   * The DateTime when a Space was created.
   */
  createdAtTime: any | null;
  /**
   * A One-To-One relationship with the Account entity that created a Space.
   */
  createdByAccount: SpaceFragment_ownedByAccount_profileSpace_createdByAccount;
  /**
   * The email address of a Space (IPFS content)
   */
  email: string | null;
  /**
   * The name of a Space (IPFS content)
   */
  name: string | null;
  /**
   * A list of the Space's links converted to a string with "comma" as a separator (IPFS content)
   */
  linksOriginal: string | null;
  /**
   * Is the Space hidden?
   */
  hidden: boolean;
  /**
   * The DateTime when a Space was updated.
   */
  updatedAtTime: any | null;
  /**
   * The total number of all Posts (public and hidden) in the current Space (post.length)
   */
  postsCount: number;
  /**
   * The URL of the Space's image (IPFS content)
   */
  image: string | null;
  /**
   * A list of a Space's tags, converted to a string with "comma" as a separator (IPFS content)
   */
  tagsOriginal: string | null;
  /**
   * The about text (bio) of a Space (IPFS content)
   */
  about: string | null;
  /**
   * A One-To-One relationship with the Account entity that owns a Space.
   */
  ownedByAccount: SpaceFragment_ownedByAccount_profileSpace_ownedByAccount;
}

export interface SpaceFragment_ownedByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
  /**
   * The total number of followers that an Account has (followers.length)
   */
  followersCount: number;
  /**
   * A One-To-One relationship with the particular Space entity which is defined as the Account Profile
   */
  profileSpace: SpaceFragment_ownedByAccount_profileSpace | null;
}

export interface SpaceFragment {
  __typename: "Space";
  /**
   * Is this a public space where anyone can post?
   */
  canEveryoneCreatePosts: boolean | null;
  /**
   * Are followers allowed to post in the Space?
   */
  canFollowerCreatePosts: boolean | null;
  /**
   * The CID of the content on IPFS
   */
  content: string | null;
  /**
   * The block height when a Space was created.
   */
  createdAtBlock: any | null;
  /**
   * The DateTime when a Space was created.
   */
  createdAtTime: any | null;
  /**
   * A One-To-One relationship with the Account entity that created a Space.
   */
  createdByAccount: SpaceFragment_createdByAccount;
  /**
   * The email address of a Space (IPFS content)
   */
  email: string | null;
  /**
   * The name of a Space (IPFS content)
   */
  name: string | null;
  /**
   * A list of the Space's links converted to a string with "comma" as a separator (IPFS content)
   */
  linksOriginal: string | null;
  /**
   * Is the Space hidden?
   */
  hidden: boolean;
  /**
   * The ID of a Space, which will have the same value and Space ID on the blockchain.
   */
  id: string;
  /**
   * The DateTime when a Space was updated.
   */
  updatedAtTime: any | null;
  /**
   * The total number of all Posts (public and hidden) in the current Space (post.length)
   */
  postsCount: number;
  /**
   * The URL of the Space's image (IPFS content)
   */
  image: string | null;
  /**
   * A list of a Space's tags, converted to a string with "comma" as a separator (IPFS content)
   */
  tagsOriginal: string | null;
  /**
   * The about text (bio) of a Space (IPFS content)
   */
  about: string | null;
  /**
   * A One-To-One relationship with the Account entity that owns a Space.
   */
  ownedByAccount: SpaceFragment_ownedByAccount;
}
