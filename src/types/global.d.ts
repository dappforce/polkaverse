// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

// This declaration says to TypeScript compiler that it's OK to import *.md files.
declare module '*.md' {
  const content: string
  export default content
}
