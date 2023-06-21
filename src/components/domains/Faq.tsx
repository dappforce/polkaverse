// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Collapse } from 'antd'
import clsx from 'clsx'
import config from 'src/config'
import CardWithContent from '../utils/cards/CardWithContent'
import styles from './index.module.sass'
import { UnamesLearnMoreLink } from './utils'

const { Panel } = Collapse

export const FaqSection = () => {
  return (
    <CardWithContent
      moveActionsToBottomInMobile={false}
      title='FAQ'
      actions={<UnamesLearnMoreLink className='font-weight-bold' />}
    >
      <Collapse ghost className={clsx(styles.FaqPanel, 'FontNormal')}>
        <Panel header={<b>What are Subsocial Usernames?</b>} key='1'>
          <p>
            Subsocial Usernames are <b>.sub</b> universal usernames for Polkadot ecosystem. Unlike
            the Ethereum Naming service, or the Polkadot Naming Service, which are like URLs for
            crypto account addresses, Subsocial Usernames are multi-purpose and can be used for
            websites, universally unique usernames, and human-friendly addresses for your Dotsama
            accounts.
          </p>
        </Panel>
        <Panel header={<b>What can I use Subsocial Usernames for?</b>} key='2'>
          <p>
            Subsocial Usernames allow for recognizability and ease of use. You can set a domain to
            redirect to your sub.id page, allowing you to verbally share every single one of your
            Substrate addresses with your friends. These simple domains are more human friendly than
            long URLs, and make life easier, while allowing customizability and creativity. Simply
            compare ksmfan.sub to 3pgFnoLz67beo6BBoMux2fxUQLFCbYAQxkQZqiobYNWjFfZV. Which is easier
            to remember and share?
          </p>
          <p>
            Subsocial Usernames will be usable in any Dotsama project that supports them. If Alice
            buys <b>alice.sub</b>, then we can simply navigate to <b>sub.id/alice</b>, or{' '}
            <b>{config.appBaseUrl}/@alice</b>, to be taken to Alice’s <b>Sub.ID</b> page, or her{' '}
            {config.appName} page, respectively. All apps in the Subsocial ecosystem will have
            built-in support for .sub usernames.
          </p>
          <p>Imagine creating a username once, and being able to use it on every app.</p>
        </Panel>
      </Collapse>
    </CardWithContent>
  )
}
