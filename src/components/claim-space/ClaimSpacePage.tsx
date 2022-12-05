import { PageContent } from '../main/PageWrapper'
import { DfImage } from '../utils/DfImage'
import Section from '../utils/Section'

const PolkadotExtLink = (
  <a href='https://github.com/polkadot-js/extension' rel='noreferrer' target='_blank'>
    Polkadot.js extension
  </a>
)

const InnerClaimSpacePage = () => (
  <>
    <p>
      <b style={{ fontSize: '1.25rem' }}>
        TL;DR: Send your Substrate address in a direct message to{' '}
        <a href='https://twitter.com/subsocialchain'>our Twitter</a> and we will transfer ownership
        to you. Read below for a detailed explanation.
      </b>
    </p>

    <p style={{ textAlign: 'center', margin: '1rem 0 0.5rem 0' }}>* * *</p>

    <p>
      In order to make sure that Polkadot ecosystem projects would have their own space&apos;s on
      Subsocial, and not be subject to cyber squatters, Subsocial has reserved spaces for Web3
      Foundation grant recipients. If you represent one of these projects, and would like to claim
      ownership for free, please complete the following steps:
    </p>

    <ol className='ListSteps'>
      <li>
        Send a private message to our official Twitter account (
        <a href='https://twitter.com/subsocialchain'>@SubsocialChain</a>) from your team&apos;s
        official account. This message should provide an address for Polkadot, Kusama or any other
        Substrate-based chain, that is associated with the account claiming ownership of the space.
      </li>
      <li>
        We will send some SUB tokens to your account address and initiate the transfer of ownership.
      </li>
      <li>
        Confirm the transfer of ownership by clicking the &quot;Accept&quot; button, as demonstrated
        in the picture below.
        <br />
        <DfImage src='/images/accept-transfer.gif' className='Screenshot' />
      </li>
      <li>
        Sign the transaction with your {PolkadotExtLink}. Use the SUB tokens sent to you in step 2
        to pay for the transaction fee.
        <br />
        <DfImage src='/images/sign-transaction.gif' className='Screenshot' />
      </li>
    </ol>
  </>
)

const ClaimSpacePage = () => (
  <PageContent meta={{ title: 'Claim Space' }}>
    <Section title='Claim Space' level={1}>
      <InnerClaimSpacePage />
    </Section>
  </PageContent>
)

export default ClaimSpacePage
