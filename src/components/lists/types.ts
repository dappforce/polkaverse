// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

export type RowKeyFn<T> = (item: T) => string | string

export type RenderItemFn<T> = (item: T, index: number) => React.ReactNode

export type InnerLoadMoreFn<T = string> = (page: number, size: number) => Promise<T[]>

export type CanHaveMoreDataFn<T> = (data: T[] | undefined, page: number) => boolean

export type DataListItemProps<T> = {
  getKey: RowKeyFn<T>
  renderItem: RenderItemFn<T>
}
