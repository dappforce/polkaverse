/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SpaceSimpleFragment
// ====================================================

export interface SpaceSimpleFragment_createdByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface SpaceSimpleFragment_ownedByAccount {
  __typename: "Account";
  /**
   * The account's public key converted to ss58 format for the Subsocial chain (prefix "28")
   */
  id: string;
}

export interface SpaceSimpleFragment {
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
  createdByAccount: SpaceSimpleFragment_createdByAccount;
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
  * A list of experimental properties of a Space
  */
  experimental?: any;
  /**
   * The about text (bio) of a Space (IPFS content)
   */
  about: string | null;
  /**
   * A One-To-One relationship with the Account entity that owns a Space.
   */
  ownedByAccount: SpaceSimpleFragment_ownedByAccount;
}
