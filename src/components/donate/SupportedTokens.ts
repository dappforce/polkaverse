// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

export const networkByCurrency: Record<string, string> = {
  DOT: 'polkadot',
  KSM: 'kusama',
  ACA: 'acala',
  ASTR: 'astar',
  KAR: 'karura',
  SDN: 'shiden',
  PHA: 'khala',
  BNC: 'bifrost',
  KILT: 'kilt',
  QTZ: 'quartz',
  AIR: 'altair',
  TEER: 'integritee',
  PDEX: 'polkadex',
  XOR: 'sora',
  PCX: 'chainx',
}

export const currencyNetworks = Object.entries(networkByCurrency)
