/* eslint-disable @typescript-eslint/no-var-requires */
// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright 2017-2019 @polkadot authors & contributors. Contributed by DAPPFORCE PRE. Ltd. Copyright 2022.

const Adapter = require('enzyme-adapter-react-16');
const Enzyme = require('enzyme');

Enzyme.configure({
  adapter: new Adapter()
});

module.exports = Enzyme;
