// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useFetchOneEntity } from 'src/rtk/app/hooksCommon'
import { DataSourceTypes, SpaceId } from 'src/types'
import { fetchSpaceEditors, selectEntityOfSpaceEditors } from './spaceEditorsSlice'

export const useFetchSpaceEditors = (spaceId: SpaceId, dataSource?: DataSourceTypes) => {
  const { loading, error, entity } = useFetchOneEntity(
    selectEntityOfSpaceEditors,
    fetchSpaceEditors,
    { id: spaceId, dataSource },
  )

  return {
    loading,
    error,
    spaceEditors: entity?.spaceEditors,
  }
}
