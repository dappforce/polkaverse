// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import dynamic from 'next/dynamic'
const Statistics = dynamic(
  () => import('../components/statistics/Statistics').then((mod: any) => mod.Statistics),
  { ssr: false },
)

export const page = () => <Statistics />
export default page
