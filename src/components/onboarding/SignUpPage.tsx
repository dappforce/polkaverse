// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import config from 'src/config'
import { PageContent } from '../main/PageWrapper'
import { DfImage } from '../utils/DfImage'

const PolkadotExtLink = (
  <a href='https://polkadot.js.org/extension' rel='noreferrer' target='_blank'>
    this link
  </a>
)

const InnerSignUpPage = () => (
  <ol className='ListSteps'>
    <li>
      {'Follow '}
      {PolkadotExtLink}{' '}
      {
        'and download the Polkadot{.js} extension for Google Chrome or Mozilla Firefox (depending on your browser).'
      }
    </li>
    <li>
      <p>
        {
          'Once the extension is installed, go to the extension menu in your browser, click on Polkadot{.js} and do the following:'
        }
      </p>
      <p>
        <ul>
          <li>Click on the “+” button at the top right corner and choose “Create new account.”</li>
          <li>
            Save your 12-word mnemonic seed phrase (the best way is to write it down on a piece of
            paper and store it somewhere safe).
          </li>
          <li>
            Mark the checkbox that says, “I have saved my mnemonic seed safely.” and press the “Next
            step” button.
          </li>
          <li>
            For the “Network” dropdown menu, just leave “Allow use on any chain” so that your
            account will be versatile.
          </li>
          <li>
            For the “Network” dropdown menu, just leave “Allow use on any chain” so that your
            account will be vPut your account name in for “A descriptive name for your account”
            (this will be displayed as your username). Specify your account password and repeat it,
            flilowing the alert tips.
          </li>
          <li>Click “Add the account with the generated seed” and you are ready to go.</li>
        </ul>
      </p>
      <p>You may also check this short video guide on the account creation process:</p>
      <DfImage src='/images/extension.gif' className='Screenshot' />
    </li>
    <li>
      Once you have created an account, go to {config.appName}, press the “Sign up” button at the
      top right corner and select your account.
      <br />
      <DfImage src='/images/sign-in.gif' className='Screenshot' />
    </li>
    <li>Congratulations! You may now use {config.appName}.</li>
  </ol>
)

const SignUpPage = () => (
  <PageContent
    meta={{ title: `Sign up on ${config.appName}` }}
    title={`Sign up on ${config.appName}`}
  >
    <InnerSignUpPage />
  </PageContent>
)

export default SignUpPage
