import { Collapse } from 'antd'
import ExternalLink from '../spaces/helpers/ExternalLink'
import styles from './Energy.module.sass'

const { Panel } = Collapse

export const FaqSection = () => {
  return (
    <div className={styles.FAQWrapper}>
      <div className={styles.FAQTitleSection}>
        <div className={styles.Title}>FAQ</div>
        <ExternalLink url={''} value={'Learn more'} />
      </div>
      <Collapse ghost expandIconPosition='left'>
        <Panel header={<b>What is energy?</b>} key='1'>
          <p>
            Energy can be used to perform actions on the network, instead of SUB tokens. Energy can
            be created by burning SUB tokens.
          </p>
        </Panel>
        <Panel header={<b>Can I transfer energy?</b>} key='2'>
          <p>No. Energy is not a token, and it cannot be transferred.</p>
        </Panel>
        <Panel header={<b>Can I give energy to other people or accounts?</b>} key='3'>
          <p>
            Yes, but only by burning SUB. An account can burn SUB to create energy in a different
            account, allowing you to burn SUB and create the energy in your friend&apos;s account,
            for example.
          </p>
        </Panel>
        <Panel header={<b>Can I convert energy back into SUB?</b>} key='4'>
          <p>No.</p>
        </Panel>
        <Panel header={<b>Is energy required to use Subsocial?</b>} key='5'>
          <p>
            No, you can pay for transactions with SUB, but it will be cheaper to turn SUB into
            energy and pay for transactions with energy.
          </p>
        </Panel>
      </Collapse>
    </div>
  )
}
